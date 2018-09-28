import { Validator } from 'jsonschema';
import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_POSSIBLE_VALUES } from '../../utils/Constants';
import Notification from './NotificationHelper';
import { NOTIFICATION_ORIGIN_DATABASE } from '../../utils/constants/ErrorConstants';
import Logger from '../../modules/util/LoggerManager';
import { ACTIVITY_CONTACT_PATHS, FIELD_OPTIONS, FIELD_PATH } from '../../utils/constants/FieldPathConstants';
import { CONTACT } from '../../utils/constants/ActivityConstants';
import ContactHelper from './ContactHelper';
import translate from '../../utils/translate';

const logger = new Logger('Possible values helper');

const optionSchema = {
  id: '/OptionSchema',
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  patternProperties: {
    // since we need an artificial "resource_type" options, then we may not be able to limit to numbers (AMP-25785)
    '^(0|[1-9]+[0-9]*)|[A-Za-z]{3,4}$': {
      type: 'object',
      properties: {
        // TODO some ids are strings while they are actually integers. Update once AMP-25785 is clarified
        id: {
          anyOf: [{ type: 'integer' }, { type: 'string' }]
        },
        value: {
          anyOf: [{ type: 'string' }]
        },
        'translated-value': { type: 'object' },
        parentId: { anyOf: [{ type: 'integer' }, { type: 'string' }] },
        reverseSortedChildren: {
          type: Array,
          items: {
            anyOf: [{ type: 'integer' }, { type: 'string' }]
          }
        }
      },
      required: ['id', 'value']
    }
  },
  additionalProperties: false
};
const possibleValuesSchema = {
  id: '/PossibleValues',
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    id: { type: 'string' },
    [FIELD_PATH]: {
      type: 'array',
      items: { type: 'string' }
    },
    [FIELD_OPTIONS]: { $ref: '/OptionSchema' }
  },
  required: ['id', FIELD_PATH, FIELD_OPTIONS]
};

const validator = new Validator();
validator.addSchema(optionSchema, '/OptionSchema');
validator.addSchema(possibleValuesSchema, '/PossibleValues');

/**
 * A simplified helper for possible values storage for loading, searching / filtering and saving possible values.
 * @author Nadejda Mandrescu
 */
const PossibleValuesHelper = {
  /**
   * Find possible values by field path
   * @param id field path like primary_sector~sector_id
   * @returns {Promise}
   */
  findById(id) {
    logger.debug('findById');
    const filter = { id };
    return this.findOne(filter);
  },

  findOne(filter) {
    logger.debug('findOne');
    return DatabaseManager.findOne(filter, COLLECTION_POSSIBLE_VALUES);
  },

  /**
   * Finds all possible values that start with the prefix, optionaly with specific ids and a filter
   * @param root (optional) the root of the path to add to the listed ids
   * @param idsWithoutRoot (optional) the ids without root
   * @param filter (optional) filter to apply
   * @return {Array}
   */
  findAllByIdsWithoutPrefixAndCleanupPrefix(root, idsWithoutRoot, filter = {}) {
    logger.debug('findAllByIdsWithoutPrefixAndCleanupPrefix');
    const hasIdsWithoutRoot = !!(idsWithoutRoot && idsWithoutRoot.length);
    let idsFilter = hasIdsWithoutRoot && { $in: idsWithoutRoot };
    if (root && root.length) {
      if (hasIdsWithoutRoot) {
        idsFilter = { $in: idsWithoutRoot.map(id => `${root}~${id}`) };
      } else {
        idsFilter = { $regex: new RegExp(`^${root}~.*`) };
      }
    }
    if (idsFilter) {
      if (filter.id) {
        filter.$and = filter.$and || [];
        filter.$and.push({ id: filter.id });
        filter.$and.push({ id: idsFilter });
        delete filter.id;
      } else {
        filter.id = idsFilter;
      }
    }
    return this.findAll(filter).then(pvs => {
      if (root && root.length) {
        pvs.forEach(pv => {
          pv.id = pv.id.substring(root.length + 1);
          pv[FIELD_PATH] = pv[FIELD_PATH].slice(1);
        });
      }
      return pvs;
    });
  },

  findAll(filter, projections) {
    logger.debug('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_POSSIBLE_VALUES, projections).then(this._preProcess);
  },

  _preProcess(pvc) {
    return PossibleValuesHelper._refreshContactOptionsWithLocalChanges(pvc).then(() => pvc);
  },

  _refreshContactOptionsWithLocalChanges(pvc) {
    const contactOptionsPVC = pvc.filter(PossibleValuesHelper.isActivityContactPV);
    if (contactOptionsPVC && contactOptionsPVC.length) {
      return ContactHelper.findAllContactsAsPossibleOptions().then(contactOptions => {
        // extend / update contact options with local new/update contact info
        contactOptionsPVC.forEach(pv => (pv[FIELD_OPTIONS] = { ...pv[FIELD_OPTIONS], ...contactOptions }));
        return pvc;
      });
    }
    return Promise.resolve(pvc);
  },

  /**
   * Saves or updates fieldValues
   * @param fieldValues structure that holds id (that is field path) and field-options
   */
  saveOrUpdate(fieldValues) {
    logger.log('saveOrUpdate');
    const validationResult = this._validate(fieldValues);
    if (validationResult.valid) {
      return DatabaseManager.saveOrUpdate(fieldValues.id, fieldValues, COLLECTION_POSSIBLE_VALUES);
    }
    return Promise.reject(this._getInvalidFormatError(validationResult.errors));
  },

  /**
   * Saves or updates possible field values collection
   * @param fieldValuesCollection
   * @return {Promise}
   */
  saveOrUpdateCollection(fieldValuesCollection) {
    logger.log('saveOrUpdateCollection');
    const validationResult = this._validateCollection(fieldValuesCollection);
    if (validationResult.valid) {
      return DatabaseManager.saveOrUpdateCollection(fieldValuesCollection, COLLECTION_POSSIBLE_VALUES);
    }
    return Promise.reject(this._getInvalidFormatError(validationResult.errors));
  },

  /**
   * Replaces entire possible field values collection
   * @param fieldValuesCollection
   * @return {Promise}
   */
  replaceAll(fieldValuesCollection) {
    logger.log('replaceAll');
    // if we are replacing existing collection, then let's just reject the new set if some of its data is invalid
    const validationResult = this._validateCollection(fieldValuesCollection);
    if (validationResult.valid) {
      return DatabaseManager.replaceCollection(fieldValuesCollection, COLLECTION_POSSIBLE_VALUES);
    }
    return Promise.reject(this._getInvalidFormatError(validationResult.errors));
  },

  _validateCollection(fieldValuesCollection) {
    const errors = [];
    const validValuesCollection = fieldValuesCollection.filter((value) => {
      const result = this._validate(value);
      if (result.errors !== undefined && result.errors.length > 0) {
        errors.push({ id: value.id, errors: result.errors });
      }
      return result.valid;
    });
    return { valid: validValuesCollection.length === fieldValuesCollection.length, errors };
  },

  _validate(fieldValues) {
    const result = validator.validate(fieldValues, possibleValuesSchema);
    if (!result.valid) {
      result.id = fieldValues.id;
    }
    return result;
  },

  /**
   * Deletes possible field values
   * @param id
   * @return {Promise}
   */
  deleteById(id) {
    logger.log('replaceAll');
    return DatabaseManager.removeById(id, COLLECTION_POSSIBLE_VALUES);
  },

  /**
   * Transforms data from AMP format to local format
   * @param fieldPath
   * @param possibleOptionsFromAMP
   * @return {{id: String, field-path: (Array|*), possible-options: { id: (String|Integer) }}}
   */
  transformToClientUsage([fieldPath, possibleOptionsFromAMP]) {
    const fieldPathParts = !fieldPath ? [] : fieldPath.split('~');
    const possibleOptions = this._transformOptions(possibleOptionsFromAMP);
    const possibleValuesForLocalUsage = {
      id: fieldPath,
      [FIELD_PATH]: fieldPathParts,
      [FIELD_OPTIONS]: possibleOptions
    };
    return possibleValuesForLocalUsage;
  },

  _transformOptions(possibleOptionsFromAMP, parentId, possibleOptions = { }) {
    if (Array.isArray(possibleOptionsFromAMP)) {
      possibleOptionsFromAMP.forEach(option => {
        possibleOptions[option.id] = option;
        option.parentId = parentId;
        if (option.children) {
          this._transformOptions(option.children, option.id, possibleOptions);
          // sort once at sync up
          option.reverseSortedChildren = option.children.sort(this.reverseSortOptions).map(o => o.id);
          delete option.children;
        }
      });
    } else {
      // delegating data structure validation to the point it will be saved to DB, now keeping options as is
      possibleOptions = possibleOptionsFromAMP;
    }
    return possibleOptions;
  },

  reverseSortOptions(o1, o2) {
    if (o1 === o2) {
      return 0;
    }
    if (o1 === null || (o2 && o1.value === null)) {
      return 1;
    }
    if (o2 === null || o2.value === null) {
      return -1;
    }
    if (o1.extra_info && o1.extra_info.index !== undefined) {
      return o2.extra_info.index - o1.extra_info.index;
    }
    return o1.value.localeCompare(o2.value) * (-1);
  },

  _getInvalidFormatError(errors) {
    const jsonError = JSON.stringify(errors).substring(0, 1000);
    const errorMessage = `${translate('Database Error')}: ${jsonError}`;
    logger.error(jsonError);
    return new Notification({ message: errorMessage, origin: NOTIFICATION_ORIGIN_DATABASE });
  },

  isActivityContactPV(pv) {
    return pv[FIELD_PATH].length === 2
      && ACTIVITY_CONTACT_PATHS.includes(pv[FIELD_PATH][0]) && pv[FIELD_PATH][1] === CONTACT;
  }
};

export default PossibleValuesHelper;
