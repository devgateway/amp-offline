import { Validator } from 'jsonschema';
import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_POSSIBLE_VALUES } from '../../utils/Constants';
import Notification from './NotificationHelper';
import { NOTIFICATION_ORIGIN_DATABASE } from '../../utils/constants/ErrorConstants';
import LoggerManager from '../../modules/util/LoggerManager';

const optionSchema = {
  id: '/OptionSchema',
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  patternProperties: {
    // TODO update based on AMP-25785 if we actually should not limit to numbers
    '^(0|[1-9]+[0-9]*)|[A-Z]{3}$': {
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
        children: {
          type: { $ref: '/OptionSchema' }
        },
        'children-ids': { type: 'array' }
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
    'field-path': {
      type: 'array',
      items: { type: 'string' }
    },
    'possible-options': { $ref: '/OptionSchema' }
  },
  required: ['id', 'field-path', 'possible-options']
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
    LoggerManager.log('findById');
    const filter = { id };
    return this.findOne(filter);
  },

  findOne(filter) {
    return DatabaseManager.findOne(filter, COLLECTION_POSSIBLE_VALUES);
  },

  findAll(filter, projections) {
    LoggerManager.log('findById');
    return DatabaseManager.findAll(filter, COLLECTION_POSSIBLE_VALUES, projections);
  },

  /**
   * Saves or updates fieldValues
   * @param fieldValues structure that holds id (that is field path) and field-options
   */
  saveOrUpdate(fieldValues) {
    LoggerManager.log('saveOrUpdate');
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
    LoggerManager.log('saveOrUpdateCollection');
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
    LoggerManager.log('replaceAll');
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
    LoggerManager.log('replaceAll');
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
    const possibleOptions = this._transformOptionAsTreeStructure(possibleOptionsFromAMP);
    const possibleValuesForLocalUsage = {
      id: fieldPath,
      'field-path': fieldPathParts,
      'possible-options': possibleOptions
    };
    return possibleValuesForLocalUsage;
  },

  _transformOptionAsTreeStructure(possibleOptionsFromAMP) {
    let possibleOptions = { };
    if (Array.isArray(possibleOptionsFromAMP)) {
      possibleOptionsFromAMP.forEach(option => {
        possibleOptions[option.id] = option;
        if (option.children) {
          option.children = this._transformOptionAsTreeStructure(option.children);
          const childrenValues = Object.values(option.children);
          const grandChildren = childrenValues.map(c => (c.children ? c['children-ids'] : []));
          // keeping the original children ids data type
          option['children-ids'] = childrenValues.map(c => c.id).concat(...grandChildren);
        }
      });
    } else {
      // delegating data structure validation to the point it will be saved to DB, now keeping options as is
      possibleOptions = possibleOptionsFromAMP;
    }
    return possibleOptions;
  },

  _getInvalidFormatError(errors) {
    const errorMessage = JSON.stringify(errors).substring(0, 1000);
    LoggerManager.error(errorMessage);
    return new Notification({ message: errorMessage, origin: NOTIFICATION_ORIGIN_DATABASE });
  }
};

export default PossibleValuesHelper;
