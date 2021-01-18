import { Validator } from 'jsonschema';
import { ActivityConstants, Constants, ErrorConstants, FieldPathConstants, CommonPossibleValuesHelper } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import Notification from './NotificationHelper';
import Logger from '../../modules/util/LoggerManager';
import ContactHelper from './ContactHelper';
import translate from '../../utils/translate';
import * as Utils from '../../utils/Utils';

const logger = new Logger('Possible values helper');

const optionSchema = {
  id: '/OptionSchema',
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  patternProperties: {
    '^(0|[1-9]+[0-9]*)$': {
      type: 'object',
      properties: {
        id: {
          type: 'integer'
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
    [FieldPathConstants.FIELD_PATH]: {
      type: 'array',
      items: { type: 'string' }
    },
    [FieldPathConstants.FIELD_OPTIONS]: { $ref: '/OptionSchema' }
  },
  required: ['id', FieldPathConstants.FIELD_PATH, FieldPathConstants.FIELD_OPTIONS]
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
    return DatabaseManager.findOne(filter, Constants.COLLECTION_POSSIBLE_VALUES);
  },

  /**
   * Finds all possible values that start with the prefix, optionally with specific ids and a filter
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
    } else if (!idsFilter) {
      const excludePrefixes = FieldPathConstants.PREFIX_LIST.filter(p => p).map(p => `${p}~.*`).join('|');
      idsFilter = { $regex: new RegExp(`^(?!${excludePrefixes})`) };
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
          pv[FieldPathConstants.FIELD_PATH] = pv[FieldPathConstants.FIELD_PATH].slice(1);
        });
      }
      return pvs;
    });
  },

  findPossibleValuesPathsFor(prefix: String) {
    return this.findAllByIdsWithoutPrefixAndCleanupPrefix(prefix).then(r => Utils.flattenToListByKey(r, 'id'));
  },

  findActivityPossibleValuesPaths() {
    const prefixToExclude = FieldPathConstants.PREFIX_LIST.filter(p => p !== FieldPathConstants.PREFIX_ACTIVITY)
      .map(p => `${p}~.*`).join('|');
    const regex = new RegExp(`^(?!(?:${prefixToExclude})).*$`);
    const filter = { id: { $regex: regex } };
    return DatabaseManager.findAll(filter, Constants.COLLECTION_POSSIBLE_VALUES, { id: 1 })
      .then(r => Utils.flattenToListByKey(r, 'id'));
  },

  findAllByExactIds(ids) {
    return DatabaseManager.findAll({ id: { $in: ids } }, Constants.COLLECTION_POSSIBLE_VALUES);
  },

  findAll(filter, projections) {
    logger.debug('findAll');
    return DatabaseManager.findAll(filter, Constants.COLLECTION_POSSIBLE_VALUES, projections).then(this._preProcess);
  },

  _preProcess(pvc) {
    return PossibleValuesHelper._refreshContactOptionsWithLocalChanges(pvc).then(() => pvc);
  },

  _refreshContactOptionsWithLocalChanges(pvc) {
    const contactOptionsPVC = pvc.filter(PossibleValuesHelper.isActivityContactPV);
    if (contactOptionsPVC && contactOptionsPVC.length) {
      return ContactHelper.findAllContactsAsPossibleOptions().then(contactOptions => {
        // extend / update contact options with local new/update contact info
        contactOptionsPVC.forEach(pv =>
          (pv[FieldPathConstants.FIELD_OPTIONS] = { ...pv[FieldPathConstants.FIELD_OPTIONS], ...contactOptions }));
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
      return DatabaseManager.saveOrUpdate(fieldValues.id, fieldValues, Constants.COLLECTION_POSSIBLE_VALUES);
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
      return DatabaseManager.saveOrUpdateCollection(fieldValuesCollection, Constants.COLLECTION_POSSIBLE_VALUES);
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
      return DatabaseManager.replaceCollection(fieldValuesCollection, Constants.COLLECTION_POSSIBLE_VALUES);
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
    logger.log('deleteById');
    return DatabaseManager.removeById(id, Constants.COLLECTION_POSSIBLE_VALUES);
  },

  /**
   * Deletes possible values for matched fields paths
   * @param ids the fields paths with possible values to delete
   * @return {*}
   */
  deleteByIds(ids) {
    logger.log('deleteByIds');
    return DatabaseManager.removeAll({ id: { $in: ids } }, Constants.COLLECTION_POSSIBLE_VALUES);
  },

  /**
   * Deletes all possible values.
   * @return {*}
   */
  deleteAll() {
    logger.log('deleteAll');
    return DatabaseManager.removeAll({ }, Constants.COLLECTION_POSSIBLE_VALUES);
  },

  /**
   * Transforms data from AMP format to local format
   * @param fieldPath
   * @param possibleOptionsFromAMP
   * @return {{id: String, field-path: (Array|*), possible-options: { id: (String|Integer) }}}
   */
  transformToClientUsage([fieldPath, possibleOptionsFromAMP]) {
    return CommonPossibleValuesHelper.transformToClientUsage([fieldPath, possibleOptionsFromAMP]);
  },

  reverseSortOptions(o1, o2) {
    return CommonPossibleValuesHelper.reverseSortOptions(o1, o2);
  },

  _getInvalidFormatError(errors) {
    const jsonError = JSON.stringify(errors).substring(0, 1000);
    const errorMessage = `${translate('Database Error')}: ${jsonError}`;
    logger.error(jsonError);
    return new Notification({ message: errorMessage, origin: ErrorConstants.NOTIFICATION_ORIGIN_DATABASE });
  },

  isActivityContactPV(pv) {
    return pv[FieldPathConstants.FIELD_PATH].length === 2
      && FieldPathConstants.ACTIVITY_CONTACT_PATHS.includes(pv[FieldPathConstants.FIELD_PATH][0])
      && pv[FieldPathConstants.FIELD_PATH][1] === ActivityConstants.CONTACT;
  }
};

export default PossibleValuesHelper;
