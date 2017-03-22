import { validate } from 'jsonschema';
import * as DatabaseManager from '../database/DatabaseManager';
import { COLLECTION_POSSIBLE_VALUES } from '../../utils/Constants';
import Notification from './NotificationHelper';
import { NOTIFICATION_ORIGIN_DATABASE } from '../../utils/constants/ErrorConstants';

const INVALID_FORMAT_ERROR = new Notification({ message: 'INVALID_FORMAT', origin: NOTIFICATION_ORIGIN_DATABASE });

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
    'possible-options': {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        value: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            value: {
              anyOf: [{ type: 'string' }, { type: 'object' }]
            }
          },
          required: ['id', 'value']
        }
      }
    }
  },
  required: ['id', 'field-path', 'possible-options']
};

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
    console.log('findById');
    const filter = { id };
    return this.findOne(filter);
  },

  findOne(filter) {
    return DatabaseManager.findOne(filter, COLLECTION_POSSIBLE_VALUES);
  },

  findAll(filter, projections) {
    console.log('findById');
    return DatabaseManager.findAll(filter, COLLECTION_POSSIBLE_VALUES, projections);
  },

  /**
   * Saves or updates fieldValues
   * @param fieldValues structure that holds id (that is field path) and field-options
   */
  saveOrUpdate(fieldValues) {
    console.log('saveOrUpdate');
    if (this._isValid(fieldValues)) {
      console.log(fieldValues);
      return DatabaseManager.saveOrUpdate(fieldValues.id, fieldValues, COLLECTION_POSSIBLE_VALUES);
    }
    return Promise.reject(INVALID_FORMAT_ERROR);
  },

  /**
   * Saves or updates possible field values collection
   * @param fieldValuesCollection
   * @return {Promise}
   */
  saveOrUpdateCollection(fieldValuesCollection) {
    console.log('saveOrUpdateCollection');
    if (this._isValidCollection(fieldValuesCollection)) {
      return DatabaseManager.saveOrUpdateCollection(fieldValuesCollection, COLLECTION_POSSIBLE_VALUES);
    }
    return Promise.reject(INVALID_FORMAT_ERROR);
  },

  /**
   * Replaces entire possible field values collection
   * @param fieldValuesCollection
   * @return {Promise}
   */
  replaceAll(fieldValuesCollection) {
    console.log('replaceAll');
    // if we are replacing existing collection, then let's just reject the new set if some of its data is invalid
    if (this._isValidCollection(fieldValuesCollection)) {
      return DatabaseManager.replaceCollection(fieldValuesCollection, COLLECTION_POSSIBLE_VALUES);
    }
    return Promise.reject(INVALID_FORMAT_ERROR);
  },

  _isValidCollection(fieldValuesCollection) {
    return fieldValuesCollection.filter(this._isValid).length === fieldValuesCollection.length;
  },

  _isValid(fieldValues) {
    return validate(fieldValues, possibleValuesSchema).valid;
  },

  /**
   * Deletes possible field values
   * @param id
   * @return {Promise}
   */
  deleteById(id) {
    console.log('replaceAll');
    return DatabaseManager.removeById(id, COLLECTION_POSSIBLE_VALUES);
  }
};

module.exports = PossibleValuesHelper;
