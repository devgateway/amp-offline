import * as PossibleValuesHelper from './PossibleValuesHelper';

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
const ActivityHydrator = {
  hydrateActivity(activity, fieldPaths) {

  },

  hydrateActivities(activities, fieldPaths) {

  },

  _hydrateValues(activity, possibleValuesMap) {

  },

  _getPossibleValues(fieldPaths) {
    const filter = {};
    if (fieldPaths && fieldPaths.length > 0) {
      filter.id = { $in: fieldPaths };
    }
    return PossibleValuesHelper.findAll(filter).then(possibleValuesCollection => {
      const possibleValuesMap = {};
      possibleValuesCollection.forEach(pv => { possibleValuesMap[pv.id] = pv.fields; });
      return possibleValuesMap;
    });
    // TODO once we have notification system, to flag if some possible values are not found, but not to block usage?
  }

};

export default ActivityHydrator;
