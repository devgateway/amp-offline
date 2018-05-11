import * as FieldsHelper from './FieldsHelper';
import Notification from './NotificationHelper';
import PossibleValuesManager from '../field/PossibleValuesManager';
import { NOTIFICATION_ORIGIN_ACTIVITY } from '../../utils/constants/ErrorConstants';
import { SYNCUP_TYPE_ACTIVITY_FIELDS } from '../../utils/Constants';
import AbstractEntityHydrator from './AbstractEntityHydrator';
/*
import { ACTIVITY_CONTACT_PATHS } from '../../utils/constants/FieldPathConstants';
import { CONTACT } from '../../utils/constants/ActivityConstants';
import ContactHelper from './ContactHelper';
import ContactHydrator from './ContactHydrator';
*/

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
export default class ActivityHydrator extends AbstractEntityHydrator {
  /*
  constructor(fieldsDef) {
    super(fieldsDef);
    this.contactHydrator = new ContactHydrator(contactsFieldsDef);
  }*/

  /**
   * Replaces each activity related objects ids with full object data for the specified field paths
   * @param activities
   * @param fieldPaths
   * @return {Object} the modified activities
   */
  hydrateActivities(activities, fieldPaths) {
    // TODO cleanup if won't use afterall
    /*
    return this._hydrateExternalEntities(activities, fieldPaths)
      .then(() => super.hydrateEntities(activities, fieldPaths));
      */
    return super.hydrateEntities(activities, fieldPaths);
  }

  /*
  _hydrateExternalEntities(activities, fieldPaths) {
    return Promise.all([this._hydrateContacts(activities, fieldPaths)]);
  }

  _hydrateContacts(activities, fieldPaths) {
    let cPaths = ACTIVITY_CONTACT_PATHS;
    if (fieldPaths && fieldPaths.length) {
      cPaths = cPaths.filter(cPath =>
        fieldPaths.includes(cPath) || fieldPaths.indexOf(fp => fp.startsWith(`${cPath}~`)) !== -1);
    }
    const contactsIds = [];
    cPaths.forEach(cType => {
      activities.forEach(a => {
        const cs = a[cType] || [];
        if (cs.length) {
          contactsIds.push(...cs.map(c => c[CONTACT]));
        }
      });
    });
    if (!contactsIds.length) {
      return Promise.resolve();
    }
    return ContactHelper.findContactsByIds(contactsIds).then(contacts => {
      const cotactById = {};
      return this.contactHydrator.hydrateEntities(contacts).then(hcs => {
        hcs.forEach(c => (cotactById[c.id] = c));
        cPaths.forEach(cType => {
          activities.forEach(a => {
            const acs = a[cType] || [];
            acs.forEach(c => (c[CONTACT] = cotactById[c[CONTACT]]));
          });
        });
        return activities;
      });
    });
  }
  */

  /**
   * Replaces each related object full data with it's id
   * @param activity
   * @param fieldPaths
   * @return {Promise.<entity>}
   */
  dehydrateActivity(activity, fieldPaths = []) {
    // TODO dehydrate contacts first
    return super.dehydrateEntity(activity, fieldPaths);
  }

  // old mechanism for locations, using v1 API
  _buildLocationHierchicalValueParts(options, selectedId) {
    const nameParts = [];
    let option = options[selectedId];
    while (option) {
      nameParts.push(PossibleValuesManager.getOptionTranslation(option));
      option = option.extra_info ? options[option.extra_info.parent_location_id] : null;
    }
    return nameParts;
  }

  /**
   * Hydrates an activity for the specified fields paths and team member
   * @param activity activities to hydrate with full field values
   * @param fieldPaths the field paths to hydrate
   * @param teamMemberId the workspace member id for which rules will be applied (or the current one if unspecified)
   * @return {Promise}
   */
  static hydrateActivity({ activity, fieldPaths, teamMemberId }) {
    return ActivityHydrator.hydrateActivities({ activities: [activity], fieldPaths, teamMemberId })
        .then(activities => activities[0]);
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
    if (teamMemberId === undefined) {
      return Promise.reject(new Notification({ message: 'noWorkspace', origin: NOTIFICATION_ORIGIN_ACTIVITY }));
    }
    return FieldsHelper.findByWorkspaceMemberIdAndType(teamMemberId, SYNCUP_TYPE_ACTIVITY_FIELDS)
      .then(fieldsDef => {
        if (fieldsDef === null) {
          throw new Notification({ message: 'noFieldsDef', origin: NOTIFICATION_ORIGIN_ACTIVITY });
        } else {
          const hydrator = new ActivityHydrator(fieldsDef[SYNCUP_TYPE_ACTIVITY_FIELDS]);
          return hydrator.hydrateActivities(activities, fieldPaths);
        }
      });
  }
}
