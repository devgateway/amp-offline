import { ActivityConstants, Constants, ErrorConstants, FieldPathConstants, ValueConstants,
  PossibleValuesManager } from 'amp-ui';
import * as FieldsHelper from './FieldsHelper';
import Notification from './NotificationHelper';
import AbstractEntityHydrator from './AbstractEntityHydrator';
import { UUID } from '../../utils/constants/ResourceConstants';

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
  constructor(fieldsDef) {
    super(fieldsDef, FieldPathConstants.PREFIX_ACTIVITY);
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
   * @param wsId the workspace id for which rules will be applied (or the current one if unspecified)
   * @return {Promise}
   */
  static hydrateActivity({ activity, fieldPaths, wsId }) {
    return ActivityHydrator.hydrateActivities({ activities: [activity], fieldPaths, wsId })
        .then(activities => activities[0]);
  }

  /**
   * Hydrates activities with full value data for the selected field paths (or all if no one specific is slected)
   * @param activities activities to hydrate with full field values
   * @param fieldPaths the field paths to hydrate
   * @param wsId the workspace id for which rules will be applied (or the current one if unspecified)
   * @return {Promise}
   */
  static hydrateActivities({ activities, fieldPaths, wsId }) {
    // Note: 926 activities are hydrated in 0.2s, where a significant time is consumed by promises
    if (wsId === undefined) {
      return Promise.reject(new Notification(
        { message: 'noWorkspace', origin: ErrorConstants.NOTIFICATION_ORIGIN_ACTIVITY }));
    }
    return FieldsHelper.findByWorkspaceIdAndTypeAndCollection(wsId, Constants.SYNCUP_TYPE_ACTIVITY_FIELDS)
      .then(fieldsDef => {
        if (fieldsDef === null) {
          throw new Notification(
            { message: 'noFieldsDef', origin: ErrorConstants.NOTIFICATION_ORIGIN_ACTIVITY });
        } else {
          const hydrator = new ActivityHydrator(fieldsDef[Constants.SYNCUP_TYPE_ACTIVITY_FIELDS]);
          return hydrator.hydrateEntities(activities, fieldPaths);
        }
      });
  }

  dehydrateActivity(activity) {
    // activity documents are not listed as possible options; for now will dehydrate explicitly
    const adocs = activity[ActivityConstants.ACTIVITY_DOCUMENTS];
    if (adocs && adocs.length) {
      adocs.forEach(ad => {
        ad[UUID] = ad[UUID] && ad[UUID][UUID];
        delete ad[ValueConstants.TMP_ENTITY_VALIDATOR];
      });
    }
    return this.dehydrateEntity(activity);
  }
}
