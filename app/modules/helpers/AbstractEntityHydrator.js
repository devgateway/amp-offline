/* eslint-disable class-methods-use-this */
import { FieldPathConstants, PossibleValuesManager } from 'amp-ui';
import Logger from '../util/LoggerManager';
import PossibleValuesHelper from './PossibleValuesHelper';

const logger = new Logger('AbstractEntityHydrator');

/**
 * A base class to be reused by different entities hydrators for common logic (moved here from ActivityHydrator).
 *
 * It replaces id-only objects with the matching full object data.
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
 *
 * @author Nadejda Mandrescu
 */
export default class AbstractEntityHydrator {
  /**
   * Initializes the hydrator
   * @param fieldsDef fields definition structure
   */
  constructor(fieldsDef, entityPrefix) {
    this._fieldsDef = fieldsDef;
    this._entityPrefix = entityPrefix;
  }

  /**
   * Replaces an entity related objects ids with full object data for the specified field paths
   * @param entity
   * @param fieldPaths
   * @return {Object} the modified entity
   */
  hydrateEntity(entity, fieldPaths = []) {
    return this.hydrateEntities(...entity, fieldPaths).then(entities => entities[0]);
  }

  /**
   * Replaces each entity related objects ids with full object data for the specified field paths
   * @param entities
   * @param fieldPaths
   * @return {Object} the modified entities
   */
  hydrateEntities(entities, fieldPaths) {
    return this._getPossibleValues(fieldPaths).then(possibleValuesCollection =>
        this._hydrateEntitiesWithFullObjects(entities, possibleValuesCollection));
  }

  /**
   * Replaces each related object full data with it's id
   * @param entity
   * @param fieldPaths
   * @return {Promise.<entity>}
   */
  dehydrateEntity(entity, fieldPaths = []) {
    return this.dehydrateEntities([entity], fieldPaths).then(entities => entities[0]);
  }

  /**
   * All entities are processed to replace each related object full data with it's id
   * @param entities
   * @param fieldPaths (optional) list of field paths to process. All are processed by default.
   * @return {*|Promise<any>}
   */
  dehydrateEntities(entities, fieldPaths = []) {
    return this._getPossibleValues(fieldPaths).then(possibleValuesCollection =>
      this._hydrateEntitiesWithFullObjects(entities, possibleValuesCollection, false));
  }

  _hydrateEntitiesWithFullObjects(entities, possibleValuesCollection, hydrate = true) {
    possibleValuesCollection.forEach(pv => this._hydrateFieldPath(entities, pv, 0, this._fieldsDef, hydrate));
    console.error(entities);
    return entities;
  }

  _hydrateFieldPath(objects, possibleValues, pathIndex, fieldDefs, hydrate = true) {
    const fieldName = possibleValues[FieldPathConstants.FIELD_PATH][pathIndex];
    const fieldDef = fieldDefs.find(fd => fd.field_name === fieldName);
    if (fieldDef === undefined) {
      const warn = `Field definition not found for: ${possibleValues[FieldPathConstants.FIELD_PATH]
        .slice(0, pathIndex + 1).join('~')}`;
      logger.warn(warn);
      return;
    }
    const isList = fieldDef.field_type === 'list';

    if (possibleValues[FieldPathConstants.FIELD_PATH].length === pathIndex + 1) {
      const options = possibleValues[FieldPathConstants.FIELD_OPTIONS];
      if (!options || !Object.keys(options).length) {
        // there may be invalid "possible-options" paths like donor_contact~contact (TDB ticket) => skipping
        logger.error(`No options available for ${possibleValues.id}. Won't hydrate / dehydrate this path.`);
        return;
      }
      // this is the last level
      objects.forEach(obj => {
        const fieldValue = obj[fieldName];
        if (fieldValue !== undefined && fieldValue !== null) {
          if (isList) {
            for (let index = 0; index < fieldValue.length; index++) {
              const currValue = fieldValue[index];
              fieldValue[index] = hydrate ? this._fillSelectedOption(possibleValues, currValue) : currValue.id;
            }
          } else {
            obj[fieldName] = hydrate ? this._fillSelectedOption(possibleValues, fieldValue) : fieldValue.id;
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

  _fillSelectedOption(possibleValues, selectedId) {
    const options = possibleValues[FieldPathConstants.FIELD_OPTIONS];
    if (FieldPathConstants.LOCATION_PATH === possibleValues.id ||
      FieldPathConstants.PATHS_WITH_TREE_STRUCTURE.has(possibleValues.id)) {
      return PossibleValuesManager.buildHierarchicalData(options, selectedId);
    }
    const selectedOption = options[selectedId];
    return selectedOption && Object.assign({}, selectedOption);
  }

  /**
   * Retrieves possible field options for specified field paths or all options if no field paths are given
   * @param fieldPaths
   * @private
   * @return {Promise}
   */
  _getPossibleValues(fieldPaths) {
    const filter = {};
    // AMP started to provide approval_status possible options, but so far there is no need to hydrate it and it is not
    // id-only field => if it will be needed, be careful when adding back to include custom validation, etc
    // TODO rather filter possible options result by non-id fields
    if (fieldPaths && fieldPaths.length > 0) {
      fieldPaths = fieldPaths.filter(path => !FieldPathConstants.DO_NOT_HYDRATE_FIELDS_LIST.includes(path));
    } else {
      filter.id = { $nin: FieldPathConstants.DO_NOT_HYDRATE_FIELDS_LIST };
    }

    return PossibleValuesHelper.findAllByIdsWithoutPrefixAndCleanupPrefix(this._entityPrefix, fieldPaths, filter)
      .then(possibleValuesCollection => {
        if (fieldPaths && fieldPaths.length !== 0 && possibleValuesCollection.length !== fieldPaths.length) {
          const missing = new Map(fieldPaths.map(fieldPath => [fieldPath, 1]));
          possibleValuesCollection.forEach(pv => missing.delete(pv.id));
          // TODO once we have notification system, to flag if some possible values are not found, but not to block
          if (missing.size > 0) {
            logger.error(`Field paths not found: ${missing.toJSON()}`);
          }
        }
        return possibleValuesCollection;
      });
  }

}
