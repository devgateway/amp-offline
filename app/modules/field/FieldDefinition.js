import * as FPC from '../../utils/constants/FieldPathConstants';

/**
 * Field Definition
 *
 * @author Nadejda Mandrescu
 */
export default class FieldDefinition {
  constructor(fieldDef = {}) {
    this._fieldDef = fieldDef;
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

  get listMaxSize() {
    return this._fieldDef[FPC.LIST_MAX_SIZE];
  }

  /**
   * @return {String|null}
   */
  get required() {
    return this._fieldDef[FPC.FIELD_REQUIRED];
  }

  get uniqueConstraint() {
    return this._fieldDef[FPC.FIELD_UNIQUE_CONSTRAINT];
  }

  get regexPattern() {
    return this._fieldDef[FPC.REGEX_PATTERN];
  }

  /**
   * @return {Array|null}
   */
  get children() {
    return this._fieldDef[FPC.FIELD_CHILDREN];
  }

  /**
   * @return {Array|null}
   */
  get dependencies() {
    return this._fieldDef[FPC.FIELD_DEPENDENCIES];
  }

  isPercentage() {
    return this._fieldDef[FPC.FIELD_PERCENTAGE] === true;
  }

  isImportable() {
    return this._fieldDef[FPC.FIELD_IMPORTABLE] === true;
  }

  allowsMultipleValues() {
    return this._fieldDef[FPC.FIELD_MULTIPLE_VALUES_ALLOWED] === true;
  }

  isTreeCollection() {
    return this._fieldDef[FPC.FIELD_TREE_COLLECTION];
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
    if (this._isList === undefined) {
      this._isList = this._fieldDef[FPC.FIELD_ITEM_TYPE] === FPC.FIELD_TYPE_LIST;
    }
    return this._isList;
  }

  /**
   * @return {boolean}
   */
  isSimpleTypeList() {
    if (this._isSimpleTypeList === undefined) {
      this._isSimpleTypeList = this.isList() && this._fieldDef[FPC.FIELD_ITEM_TYPE] !== FPC.FIELD_TYPE_OBJECT;
    }
    return this._isSimpleTypeList;
  }

  hasChildren() {
    if (this._hasChildren === undefined) {
      this._hasChildren = this.isList() && this._fieldDef.children;
    }
    return this._hasChildren;
  }
}
