import * as FPC from '../../utils/constants/FieldPathConstants';

/**
 * Field Definition
 *
 * @author Nadejda Mandrescu
 */
export default class FieldDefinition {
  constructor(fieldDef = {}) {
    this._fieldDef = fieldDef;
    this._isList = fieldDef[FPC.FIELD_ITEM_TYPE] === FPC.FIELD_TYPE_LIST;
    this._isSimpleTypeList = this._isList && fieldDef[FPC.FIELD_ITEM_TYPE] !== FPC.FIELD_TYPE_OBJECT;
  }

  /**
   * @return {String} an internal unchangeable name (not affected by translations or country) like ID
   */
  get name() {
    return this._fieldDef[FPC.FIELD_NAME];
  }

  get label() {
    return this._fieldDef[FPC.FIELD_LABEL];
  }

  /**
   * @return {String}
   */
  get type() {
    return this._fieldDef[FPC.FIELD_TYPE];
  }

  get length() {
    return this._fieldDef[FPC.FIELD_LENGTH];
  }

  /**
   * @return {String|null}
   */
  get required() {
    return this._fieldDef[FPC.FIELD_REQUIRED];
  }

  /**
   * @return {Array|null}
   */
  get children() {
    return this._fieldDef.children;
  }

  /**
   * @return {boolean} flags if always required
   */
  isAlwaysRequired() {
    return this.required === 'Y';
  }

  /**
   * @return {boolean} flags if required for Non-Draft
   */
  isRequiredND() {
    return this.required === 'ND';
  }

  /**
   * @return {boolean}
   */
  isIdOnly() {
    return this._fieldDef[FPC.FIELD_ID_ONLY] === true;
  }

  /**
   * @return {boolean}
   */
  isList() {
    return this._isList;
  }

  /**
   * @return {boolean}
   */
  isSimpleTypeList() {
    return this._isSimpleTypeList;
  }
}
