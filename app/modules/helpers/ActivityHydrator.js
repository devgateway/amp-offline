import * as PossibleValuesHelper from './PossibleValuesHelper';
import * as FieldsHelper from './FieldsHelper';
import { store } from '../../index';
import Notification from './NotificationHelper';
import { NOTIFICATION_ORIGIN_ACTIVITY_HYDRATOR } from '../../utils/constants/ErrorConstants';

/* eslint-disable class-methods-use-this */

/**
 * This is a helper class that replaces id-only objects with the matching full object data.
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

  hydrateActivity(activity, fieldPaths: []) {
    return this.hydrateActivities(...activity, fieldPaths);
  }

  hydrateActivities(activities, fieldPaths) {
    const possibleValuesMap = this._getPossibleValues(fieldPaths);
    possibleValuesMap.forEach(pv => this._hydrateFieldPath(activities, pv, 0, this._fieldsDef));
  }

  _hydrateFieldPath(objects, possibleValues, pathIndex, fieldDefs) {
    const fieldName = possibleValues['field-path'][pathIndex];
    const fieldDef = fieldDefs.findFirst(fd => fd.field_name === fieldName);
    const isList = fieldDef.field_type === 'list';

    if (possibleValues['field-path'].length === pathIndex + 1) {
      // this is the last level
      const options = possibleValues['possible-options'];
      objects.forEach(obj => {
        const fieldValue = obj[fieldName];
        if (fieldValue !== undefined) {
          if (isList) {
            for (let index = 0; index < fieldValue.length; index++) {
              const id = fieldValue[index];
              fieldValue[index] = options[id];
            }
          } else {
            obj[fieldName] = options[fieldValue]; // eslint-disable-line no-param-reassign
          }
        }
      });
    } else {
      let nextLevelObjects = [];
      objects.forEach(obj => {
        const fieldValue = obj[fieldName];
        if (fieldValue !== undefined) {
          if (isList) {
            nextLevelObjects = nextLevelObjects.concat(fieldValue);
          } else {
            nextLevelObjects.push(fieldValue);
          }
        }
      });
      this._hydrateFieldPath(nextLevelObjects, possibleValues, pathIndex + 1, fieldDefs.children);
    }
  }

  _getPossibleValues(fieldPaths) {
    const filter = {};
    if (fieldPaths && fieldPaths.length > 0) {
      filter.id = { $in: fieldPaths };
    }
    return PossibleValuesHelper.findAll(filter);
    // TODO once we have notification system, to flag if some possible values are not found, but not to block usage?
  }

  /**
   * Hydrates an activity for the specified fields paths and team member
   * @param activity activities to hydrate with full field values
   * @param fieldPaths the field paths to hydrate
   * @param teamMember the workspace member for which rules will be applied (or the current one if unspecified)
   */
  static hydrateActivity({ activity, fieldPaths, teamMember }) {
    return ActivityHydrator.hydrateActivities({ activities: [activity], fieldPaths, teamMember });
  }

  /**
   * Hydrates activities with full value data for the selected field paths (or all if no one specific is slected)
   * @param activities activities to hydrate with full field values
   * @param fieldPaths the field paths to hydrate
   * @param teamMember the workspace member for which rules will be applied (or the current one if unspecified)
   */
  static hydrateActivities({ activities, fieldPaths, teamMember }) {
    return new Promise((resolve, reject) => {
      if (teamMember === undefined) {
        teamMember = store.getState().user.teamMember; // eslint-disable-line no-param-reassign
        if (teamMember === undefined) {
          reject(new Notification({ message: 'noWorkspace', origin: NOTIFICATION_ORIGIN_ACTIVITY_HYDRATOR }));
        }
      }
      return FieldsHelper.findByWorkspaceMemberId(teamMember.id).then((fieldsDef) => {
        if (fieldsDef === null) {
          throw new Notification({ message: 'noFieldsDef', origin: NOTIFICATION_ORIGIN_ACTIVITY_HYDRATOR });
        } else {
          const hydrator = new ActivityHydrator(fieldsDef);
          hydrator.hydrateActivities(activities, fieldPaths);
          return resolve();
        }
      }).catch(reject);
    });
  }
}
