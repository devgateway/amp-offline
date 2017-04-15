import * as PossibleValuesHelper from './PossibleValuesHelper';
import * as FieldsHelper from './FieldsHelper';
import store from '../../index';
import Notification from './NotificationHelper';
import { NOTIFICATION_ORIGIN_ACTIVITY } from '../../utils/constants/ErrorConstants';
import LoggerManager from '../util/LoggerManager';

/* eslint-disable class-methods-use-this */

/**
 * This is a helper class that replaces id-only objects with the matching full object data.
 * This class will also provide the reverse dehydration mechanism.
 * Sample unhydrated field:
 * {
 *  "donor_organization": [
 *    {
 *      "organization" : 12, // id only field
 *      ...
 *    },
 *    ...
 *    ],
 * }
 * This will be hydrated to:
 * {
 *   "donor_organization": [
 *      {
 *        "organization": {
 *          "id": 105,
 *          "value": {"en": "Volet Trésor"}
 *        },
 *        ...
 *      },
 *      ...
 *    ],
 * }
 * @author Nadejda Mandrescu
 */
export default class ActivityHydrator {
  /**
   * Initializes the activity hydrator
   * @param fieldsDef fields definition structure
   */
  constructor(fieldsDef) {
    this._fieldsDef = fieldsDef;
  }

  /**
   * Replaces an activity related objects ids with full object data for the specified field paths
   * @param activity
   * @param fieldPaths
   * @return {Object} the modified activity
   */
  hydrateActivity(activity, fieldPaths = []) {
    return this.hydrateActivities(...activity, fieldPaths).then(activities => activities[0]);
  }

  /**
   * Replaces each activity related objects ids with full object data for the specified field paths
   * @param activities
   * @param fieldPaths
   * @return {Object} the modified activities
   */
  hydrateActivities(activities, fieldPaths) {
    return new Promise((resolve, reject) =>
      this._getPossibleValues(fieldPaths).then(possibleValuesCollection =>
        this._hydrateActivitiesWithFullObjects(activities, possibleValuesCollection)).then(resolve).catch(reject));
  }

  /**
   * Replaces each related object full data with it's id
   * @param activity
   * @param fieldPaths
   * @return {Promise.<activity>}
   */
  dehydrateActivity(activity, fieldPaths = []) {
    return this._getPossibleValues(fieldPaths).then(possibleValuesCollection =>
      this._hydrateActivitiesWithFullObjects([activity], possibleValuesCollection, false))
      .then(activities => activities[0]);
  }

  _hydrateActivitiesWithFullObjects(activities, possibleValuesCollection, hydrate = true) {
    possibleValuesCollection.forEach(pv => this._hydrateFieldPath(activities, pv, 0, this._fieldsDef, hydrate));
    return activities;
  }

  _hydrateFieldPath(objects, possibleValues, pathIndex, fieldDefs, hydrate = true) {
    const fieldName = possibleValues['field-path'][pathIndex];
    const fieldDef = fieldDefs.find(fd => fd.field_name === fieldName);
    if (fieldDef === undefined) {
      const warn = `Field definition not found for: ${possibleValues['field-path'].slice(0, pathIndex + 1).join('~')}`;
      LoggerManager.warn(warn);
      return;
    }
    const isList = fieldDef.field_type === 'list';

    if (possibleValues['field-path'].length === pathIndex + 1) {
      // this is the last level
      const options = possibleValues['possible-options'];
      objects.forEach(obj => {
        const fieldValue = obj[fieldName];
        if (fieldValue !== undefined && fieldValue !== null) {
          if (isList) {
            for (let index = 0; index < fieldValue.length; index++) {
              const currValue = fieldValue[index];
              fieldValue[index] = hydrate ? options[currValue] : currValue.id;
            }
          } else {
            obj[fieldName] = hydrate ? options[fieldValue] : fieldValue.id;
          }
        }
      });
    } else {
      let nextLevelObjects = [];
      objects.forEach(obj => {
        const fieldValue = obj[fieldName];
        if (fieldValue !== undefined && fieldValue !== null) {
          if (isList) {
            nextLevelObjects = nextLevelObjects.concat(fieldValue);
          } else {
            nextLevelObjects.push(fieldValue);
          }
        }
      });
      if (nextLevelObjects.length > 0) {
        this._hydrateFieldPath(nextLevelObjects, possibleValues, pathIndex + 1, fieldDef.children, hydrate);
      }
    }
  }

  /**
   * Retrieves possible field options for specified field paths or all options if no field paths are given
   * @param fieldPaths
   * @private
   * @return {Promise}
   */
  _getPossibleValues(fieldPaths) {
    const filter = {};
    if (fieldPaths && fieldPaths.length > 0) {
      filter.id = { $in: fieldPaths };
    }
    return PossibleValuesHelper.findAll(filter).then(possibleValuesCollection => {
      if (fieldPaths && fieldPaths.legth !== 0 && possibleValuesCollection.length !== fieldPaths.length) {
        const missing = new Map(fieldPaths.map(fieldPath => [fieldPath, 1]));
        possibleValuesCollection.forEach(pv => missing.delete(pv.id));
        // TODO once we have notification system, to flag if some possible values are not found, but not to block usage
        if (missing.size > 0) {
          LoggerManager.error(`Field paths not found: ${missing.toJSON()}`);
        }
      }
      return possibleValuesCollection;
    });
  }

  /**
   * Hydrates an activity for the specified fields paths and team member
   * @param activity activities to hydrate with full field values
   * @param fieldPaths the field paths to hydrate
   * @param teamMemberId the workspace member id for which rules will be applied (or the current one if unspecified)
   * @return {Promise}
   */
  static hydrateActivity({ activity, fieldPaths, teamMemberId }) {
    return new Promise((resolve, reject) =>
      ActivityHydrator.hydrateActivities({ activities: [activity], fieldPaths, teamMemberId })
        .then(activities => resolve(activities[0]))
        .catch(reject)
    );
  }

  /**
   * Hydrates activities with full value data for the selected field paths (or all if no one specific is slected)
   * @param activities activities to hydrate with full field values
   * @param fieldPaths the field paths to hydrate
   * @param teamMemberId the workspace member id for which rules will be applied (or the current one if unspecified)
   * @return {Promise}
   */
  static hydrateActivities({ activities, fieldPaths, teamMemberId }) {
    // Note: 926 activities are hydrated in 0.2s, where a significant time is consumed by promises
    return new Promise((resolve, reject) => {
      if (teamMemberId === undefined) {
        teamMemberId = store.getState().user.teamMember ? store.getState().user.teamMember.id : undefined;
        if (teamMemberId === undefined) {
          reject(new Notification({ message: 'noWorkspace', origin: NOTIFICATION_ORIGIN_ACTIVITY }));
        }
      }
      return FieldsHelper.findByWorkspaceMemberId(teamMemberId).then((fieldsDef) => {
        if (fieldsDef === null) {
          throw new Notification({ message: 'noFieldsDef', origin: NOTIFICATION_ORIGIN_ACTIVITY });
        } else {
          const hydrator = new ActivityHydrator(fieldsDef.fields);
          return hydrator.hydrateActivities(activities, fieldPaths).then(resolve).catch(reject);
        }
      }).catch(reject);
    });
  }
}
