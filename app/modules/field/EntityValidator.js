/* eslint-disable class-methods-use-this */
import * as AC from '../../utils/constants/ActivityConstants';
import * as FPC from '../../utils/constants/FieldPathConstants';
import { DEFAULT_DATE_FORMAT } from '../../utils/constants/GlobalSettingsConstants';
import { INTERNAL_DATE_FORMAT } from '../../utils/Constants';
import translate from '../../utils/translate';
import Logger from '../util/LoggerManager';
import GlobalSettingsManager from '../util/GlobalSettingsManager';
import DateUtils from '../../utils/DateUtils';
import FieldsManager from './FieldsManager';
import {
  COMMITMENTS,
  DISBURSEMENTS,
  ON_BUDGET,
  TMP_ENTITY_VALIDATOR as VC_TMP_ENTITY_VALIDATOR
} from '../../utils/constants/ValueConstants';
import PossibleValuesManager from './PossibleValuesManager';
import { CLIENT_CHANGE_ID_PREFIX, FAX, PHONE } from '../../utils/constants/ContactConstants';
import ValidationErrorsCollector from './ValidationErrorsCollector';
import ValidationError from './ValidationError';
import * as Utils from '../../utils/Utils';
import { CLIENT_CHANGE_ID, VALIDATE_ON_CHANGE_ONLY } from '../../utils/constants/EntityConstants';
import * as RC from '../../utils/constants/ResourceConstants';
import FieldDefinition from './FieldDefinition';

const logger = new Logger('EntityValidator');

/**
 * Entity Validator
 * @author Nadejda Mandrescu
 */
export default class EntityValidator {
  constructor(entity, fieldsManager: FieldsManager, otherProjectTitles: Array,
    excludedFields = [AC.APPROVAL_DATE, AC.APPROVAL_STATUS, AC.APPROVED_BY]) {
    logger.log('constructor');
    this._entity = entity;
    this._fieldsDef = fieldsManager.fieldsDef;
    this._possibleValuesMap = fieldsManager.possibleValuesMap;
    this._fieldsManager = fieldsManager;
    this._otherProjectTitles = new Set(otherProjectTitles);
    this.excludedFields = excludedFields || [];
    this.errorsCollector = new ValidationErrorsCollector();
  }

  set entity(entity) {
    this._entity = entity;
  }

  areAllConstraintsMet(entity, asDraft, fieldPathsToSkipSet) {
    logger.log('areAllConstraintsMet');
    this.errorsCollector.clear();
    this._initGenericErrors();
    this._areAllConstraintsMet([entity], this._fieldsDef, asDraft, undefined, fieldPathsToSkipSet);
    return this.errorsCollector.errors;
  }

  _areAllConstraintsMet(objects, fieldsDef, asDraft, currentPath, fieldPathsToSkipSet) {
    logger.debug('_areAllConstraintsMet');
    fieldsDef.forEach(fieldDef => {
      const fd = new FieldDefinition(fieldDef);
      const fieldPath = `${currentPath ? `${currentPath}~` : ''}${fd.name}`;
      this._clearErrorState(objects, fieldPath);
      if (!fieldPathsToSkipSet || !fieldPathsToSkipSet.has(fieldPath)) {
        this._validateRequiredField(objects, fd, fieldPath, asDraft);
        this._validateDependencies(objects, fieldPath, fd);
        // once required fields are checked, exclude objects without values from further validation
        const objectsWithFDValues = objects.filter(o => o[fd.name] !== null && o[fd.name] !== undefined);
        this._validateValue(objectsWithFDValues, asDraft, fd, fieldPath);
        if (fd.isList() && fd.isImportable() && !this._firstLevelOnly) {
          let childrenObj = objectsWithFDValues.map(o => o[fd.name]);
          // isList === either an actual list or a complex object
          if (Array.isArray(childrenObj[0])) {
            childrenObj = childrenObj.reduce((curr, children) => {
              curr.push(...children);
              return curr;
            }, []);
          }
          if (fd.isSimpleTypeList()) {
            // simulate complex structure for value data type validation only
            childrenObj = childrenObj.map(o => Utils.toMap(fd.name, o));
            const elemFieldDef = new FieldDefinition({
              [FPC.FIELD_NAME]: fd.name,
              [FPC.FIELD_TYPE]: fd.itemType
            });
            this._validateValue(childrenObj, asDraft, elemFieldDef, fieldPath);
          } else {
            this._areAllConstraintsMet(childrenObj, fd.children, asDraft, fieldPath, fieldPathsToSkipSet);
          }
        }
      }
    });
  }

  _clearErrorState(objects, fieldPath) {
    objects.forEach(o => {
      if (o.errors) {
        o.errors = o.errors.filter(e => e.path !== fieldPath);
        if (!o.errors.length) {
          delete o.errors;
        }
      }
    });
  }

  processValidationResult(parent, fieldPath, validationResult) {
    if (validationResult === true || validationResult === null || validationResult === undefined) return;
    const error = new ValidationError(fieldPath, validationResult);
    if (!parent.errors) {
      parent.errors = [];
    }
    parent.errors.push(error);
    this.errorsCollector.addError(error);
  }

  validateField(parent, asDraft, fieldDef: FieldDefinition, mainFieldPath) {
    logger.debug('validateField');
    this._initGenericErrors();
    this.errorsCollector.clear();
    this._firstLevelOnly = true;
    this._validateField(parent, asDraft, fieldDef, mainFieldPath);
    this._firstLevelOnly = false;
    return this.errorsCollector.errors;
  }

  _validateField(parent, asDraft, fieldDef: FieldDefinition, mainFieldPath) {
    let fieldPath = mainFieldPath;
    // normally we fieldPath includes fieldDef field name, but checking it just in case
    if (fieldPath.endsWith(fieldDef.name)) {
      if (fieldPath === fieldDef.name) {
        fieldPath = '';
      } else {
        fieldPath = fieldPath.substring(0, fieldPath.length - fieldDef.name.length - 1);
      }
    }
    this._areAllConstraintsMet([parent], [fieldDef], asDraft, fieldPath, null);
    this._validateDependentFields(asDraft, mainFieldPath);
  }

  _validateDependentFields(asDraft, mainFieldPath) {
    // TODO going custom until we have more generic dependencies definition in API
    let dependencies = [];
    if (mainFieldPath === AC.ACTIVITY_BUDGET) {
      dependencies = [AC.DEPENDENCY_PROJECT_CODE_ON_BUDGET, AC.DEPENDENCY_ON_BUDGET];
    } else if (FPC.RELATED_ORGS_PATHS.includes(mainFieldPath)) {
      dependencies = [AC.DEPENDENCY_COMPONENT_FUNDING_ORG_VALID];
    }
    const fieldPaths = this._fieldsManager.getFieldPathsByDependencies(dependencies);
    fieldPaths.forEach(fieldPath => {
      const parentPath = fieldPath.substring(0, fieldPath.lastIndexOf('~'));
      const parent = this._fieldsManager.getValue(this._entity, parentPath);
      if (parent) {
        const fieldDef = new FieldDefinition(this._fieldsManager.getFieldDef(fieldPath));
        // flatten parents to the last leaf level
        let depth = parentPath.split('~').length;
        let parents = depth > 1 ? parent : [parent];
        while (depth > 1) {
          const flattenedParents = [];
          parents.forEach(child => flattenedParents.push(...child));
          depth -= 1;
          parents = flattenedParents;
        }
        parents.forEach(par => this._validateField(par, asDraft, fieldDef, fieldPath));
      }
    });
  }

  _validateValueIfRequired(value, asDraft, fieldDef) {
    const isRequired = (fieldDef.required === 'Y' || (fieldDef.required === 'ND' && asDraft === false));
    return this._validateRequired(value, isRequired);
  }

  _validateRequired(value, isRequired) {
    const invalidValue = isRequired &&
      (value === undefined || value === null ||
        (value.trim && value.trim() === '') ||
        (value.length !== undefined && value.length === 0));
    return invalidValue ? translate('requiredField') : true;
  }

  _validateRequiredField(objects, fieldDef: FieldDefinition, fieldPath, asDraft) {
    logger.log('_validateRequiredField');
    let isRequired = fieldDef.isAlwaysRequired() || (fieldDef.isRequiredND() && !asDraft);
    if (this.excludedFields.filter(f => (fieldDef.name === f)).length > 0) {
      isRequired = false;
    }
    if (isRequired) {
      objects.forEach(obj => {
        if (this.isRequiredDependencyMet(obj, fieldDef, fieldPath)) {
          this.processValidationResult(obj, fieldPath, this._validateRequired(obj[fieldDef.name], true));
        }
      });
    }
  }

  _initGenericErrors() {
    const gsDateFormat = GlobalSettingsManager.getSettingByKey(DEFAULT_DATE_FORMAT);
    this.invalidValueError = translate('invalidValue');
    this.invalidString = translate('invalidString');
    this.invalidNumber = translate('invalidNumber2');
    this.invalidBoolean = translate('invalidBoolean');
    this.invalidTitle = translate('duplicateTitle');
    // though we'll validate internal format, we have to report user friendly format
    this.invalidDate = translate('invalidDate').replace('%gs-format%', gsDateFormat);
  }

  _validateValue(objects, asDraft, fieldDef: FieldDefinition, fieldPath) {
    logger.debug('_validateValue');
    const fieldLabel = this._fieldsManager.getFieldLabelTranslation(fieldPath);
    const wasHydrated = this._wasHydrated(fieldPath);
    const stringLengthError = translate('stringTooLong').replace('%fieldName%', fieldLabel);
    const isLookupChild = fieldDef.hasChildren() && fieldDef.isImportable();
    const percentageChild = isLookupChild && fieldDef.children.find(childDef => childDef.percentage === true);
    const idOnlyField = isLookupChild && fieldDef.children.find(childDef => childDef.id_only === true);
    const maxListSize = fieldDef.listMaxSize;
    const listLengthError = translate('listTooLong')
      .replace('%fieldName%', fieldLabel).replace('%sizeLimit%', maxListSize);
    const regexPattern = fieldDef.regexPattern ? new RegExp(fieldDef.regexPattern) : null;
    const regexError = this._getRegexError(regexPattern, fieldPath);
    // it could be faster to do outer checks for the type and then go through the list for each type,
    // but realistically there won't be many objects in the list, that's why opting for clear code
    objects.forEach(obj => {
      const value = this._getValue(obj, fieldDef, wasHydrated);
      if (fieldDef.isList()) {
        if (!Array.isArray(value)) {
          // for complex objects it is also a list of properties
          if (!(value instanceof Object)) {
            this.processValidationResult(obj, fieldPath, this.invalidValueError);
          }
        } else if (fieldDef.isImportable()) {
          if (percentageChild) {
            // similarly to AMP, we should report total error if there are % set. E.g. In Niger, Programs % is optional.
            const childrenValues = value.filter(child => child && child instanceof Object
              && this._hasValue(child[percentageChild.field_name]));
            const totError = this.totalPercentageValidator(childrenValues, percentageChild.field_name);
            this.processValidationResult(obj, fieldPath, totError);
          }
          if (fieldDef.uniqueConstraint) {
            const uc = fieldDef.isSimpleTypeList() ? null : fieldDef.uniqueConstraint;
            this.processValidationResult(obj, fieldPath, this.uniqueValuesValidator(value, uc));
          }
          if (!fieldDef.allowsMultipleValues()) {
            const noMultipleValuesError = this.noMultipleValuesValidator(value, fieldDef.name);
            this.processValidationResult(obj, fieldPath, noMultipleValuesError);
          }
          if (fieldDef.isTreeCollection()) {
            const idOnlyFieldPath = `${fieldPath}~${idOnlyField.field_name}`;
            const noParentChildMixingError = this.noParentChildMixing(value, idOnlyFieldPath, idOnlyField.field_name);
            this.processValidationResult(obj, fieldPath, noParentChildMixingError);
          }
          if (maxListSize && value.length > maxListSize) {
            this.processValidationResult(obj, fieldPath, listLengthError);
          }
        }
      } else if (fieldDef.type === 'string') {
        if (this._wasValidatedSeparately(obj, fieldPath, fieldDef, asDraft)) {
          // TODO multilingual support Iteration 2+
        } else if (!(typeof value === 'string' || value instanceof String)) {
          this.processValidationResult(obj, fieldPath, this.invalidString.replace('%value%', value));
        } else {
          if (fieldDef.length && fieldDef.length < value.length) {
            this.processValidationResult(obj, fieldPath, stringLengthError);
          }
          if (fieldPath === AC.PROJECT_TITLE) {
            this.processValidationResult(obj, fieldPath, this.projectTitleValidator(value));
          }
          if (regexPattern && !regexPattern.test(value)) {
            this.processValidationResult(obj, fieldPath, regexError);
          }
        }
      } else if (fieldDef.type === 'long') {
        if (!Number.isInteger(value) && !this._isAllowInvalidNumber(value, fieldPath)) {
          this.processValidationResult(obj, fieldPath, this.invalidNumber);
        } else {
          this._wasValidatedSeparately(obj, fieldPath, fieldDef, asDraft);
        }
      } else if (fieldDef.type === 'float') {
        if (value !== +value || value.toString().indexOf('e') > -1) {
          this.processValidationResult(obj, fieldPath, this.invalidNumber);
        }
      } else if (fieldDef.type === 'boolean') {
        if (!(typeof value === 'boolean' || value instanceof Boolean)) {
          this.processValidationResult(obj, fieldPath, this.invalidBoolean.replace('%value%', value));
        }
      } else if (fieldDef.type === 'date') {
        if (!(typeof value === 'string' || value instanceof String)
          || !(value !== '' && DateUtils.isValidDateFormat(value, INTERNAL_DATE_FORMAT))) {
          this.processValidationResult(obj, fieldPath, this.invalidDate.replace('%value%', value));
        }
      }
      if (fieldDef.isPercentage()) {
        this.processValidationResult(obj, fieldPath, this.percentValueValidator(value, fieldPath));
      }
    });
  }

  _wasHydrated(fieldPath) {
    return !!this._possibleValuesMap[fieldPath] && !FPC.DO_NOT_HYDRATE_FIELDS_LIST.includes(fieldPath);
  }

  _getValue(obj, fieldDef: FieldDefinition, wasHydrated) {
    let value = obj[fieldDef.name];
    value = !fieldDef.isSimpleTypeList() && wasHydrated && value ? value.id : value;
    return value;
  }

  _hasValue(value) {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Since real ids are generated by AMP, on the client we store temporary ids. During sync up of new related data
   * this temporary ids should be normally replaced with real ids in the references as well, which will then
   * comply with the API fields validation.
   * @param value the field value
   * @param fieldPath full path of the field
   * @return {boolean} whether this invalid number is acceptaple during validation
   * @private
   */
  _isAllowInvalidNumber(value, fieldPath) {
    const parts = fieldPath.split('~');
    const isContactId = (parts.length === 2 && FPC.ACTIVITY_CONTACT_PATHS.includes(parts[0]) && AC.CONTACT === parts[1])
      || (parts.length === 1 && this.excludedFields.includes(parts[0]));
    if (isContactId && `${value}`.startsWith(CLIENT_CHANGE_ID_PREFIX)) {
      return true;
    }
    return false;
  }

  _wasValidatedSeparately(obj, fieldPath, fieldDef: FieldDefinition, asDraft) {
    const hValue = obj[fieldDef.name];
    const entityValidator = hValue && hValue[VC_TMP_ENTITY_VALIDATOR];
    if (entityValidator) {
      if (entityValidator._entity[VALIDATE_ON_CHANGE_ONLY] && !entityValidator._entity[CLIENT_CHANGE_ID]) {
        return true;
      }
      let validationError = entityValidator.areAllConstraintsMet(entityValidator._entity, asDraft);
      validationError = validationError.length ? Utils.joinMessages(validationError.map(ve => ve.toString())) : null;
      this.processValidationResult(obj, fieldPath, validationError);
      return true;
    }
    return false;
  }

  _getRegexError(regexPattern, fieldPath) {
    if (regexPattern) {
      let errorLabel = `invalidFormat-${fieldPath}`;
      let error = translate(errorLabel);
      if (error === errorLabel && fieldPath.startsWith(`${FAX}~`)) {
        // workaround for duplicate trn message that we avoid defining in master-translations
        errorLabel = `invalidFormat-${fieldPath.replace(FAX, PHONE)}`;
        error = translate(errorLabel);
      }
      if (error === errorLabel) {
        return translate('invalidFormat-generic');
      }
      return error;
    }
    return null;
  }

  projectTitleValidator(value) {
    logger.log('projectTitleValidator');
    return !this._otherProjectTitles.has(value) || this.invalidTitle;
  }

  /**
   * Percentage field validator
   * @param value the value to test
   * @param fieldPath full field path, used to detect field label to be used for error message
   * @return {String|boolean} String if an error detected, true if valid
   */
  percentValueValidator(value, fieldPath) {
    logger.log('percentValueValidator');
    let validationError = null;
    value = Number(value);
    // using the same messages as in AMP
    if (!Number.isFinite(value)) {
      validationError = translate('percentageValid');
    } else if (value < 0) {
      validationError = translate('percentageMinimumError');
    } else if (value > 100) {
      validationError = translate('percentageRangeError');
    }
    if (validationError) {
      const fieldLabel = this._fieldsManager.getFieldLabelTranslation(fieldPath);
      validationError = validationError.replace('%percentageField%', fieldLabel);
    }
    return validationError || true;
  }

  /**
   * Total percentage values validator
   * @param values the values to validate
   * @param fieldName
   * @return {String|boolean}
   */
  totalPercentageValidator(values, fieldName) {
    logger.log('totalPercentageValidator');
    let validationError = null;
    const totalPercentage = values.reduce((totPercentage, val) => {
      totPercentage += val[fieldName] === +val[fieldName] ? val[fieldName] : 0;
      return totPercentage;
    }, 0);
    if (values.length && totalPercentage !== 100) {
      validationError = translate('percentageSumError').replace('%totalPercentage%', totalPercentage);
    }
    return validationError || true;
  }

  /**
   * Unique values validator
   * @param values the values to validate
   * @param fieldName which field entries must be unique
   * @return {String|boolean}
   */
  uniqueValuesValidator(values, fieldName) {
    logger.log('uniqueValuesValidator');
    let validationError = null;
    const repeating = new Set();
    const unique = new Set();
    values.forEach(item => {
      const option = fieldName ? item[fieldName] : item;
      const id = option.id;
      const value = option[AC.HIERARCHICAL_VALUE] || option.value;
      if (unique.has(id)) {
        repeating.add(value);
      } else {
        unique.add(id);
      }
    });
    if (repeating.size > 0) {
      const repeated = Array.from(repeating.values()).join(', ');
      validationError = translate('nonUniqueItemsError').replace('%repetitions%', repeated);
    }
    return validationError || true;
  }

  noMultipleValuesValidator(values, fieldName) {
    logger.log('noMultipleValuesValidator');
    if (values && values.length > 1) {
      const friendlyFieldName = this._fieldsManager.getFieldLabelTranslation(fieldName);
      return translate('multipleValuesNotAllowed').replace('%fieldName%', friendlyFieldName || fieldName);
    }
    return true;
  }

  noParentChildMixing(values, fieldPath, noParentChildMixingFieldName) {
    logger.log('noParentChildMixing');
    const options = this._possibleValuesMap[fieldPath];
    const uniqueRoots = new Set(values.map(v => v[noParentChildMixingFieldName].id));
    const childrenMixedWithParents = [];
    values.forEach(value => {
      let parentId = value[noParentChildMixingFieldName].parentId;
      while (parentId) {
        if (uniqueRoots.has(parentId)) {
          childrenMixedWithParents.push(value[noParentChildMixingFieldName][AC.HIERARCHICAL_VALUE]);
          uniqueRoots.delete(value[noParentChildMixingFieldName].id);
          parentId = null;
        } else {
          parentId = options[parentId] && options[parentId].parentId;
        }
      }
    });

    if (childrenMixedWithParents.length > 0) {
      const childrenNames = childrenMixedWithParents.join(', ');
      return translate('noParentChildMixing').replace('%children%', childrenNames);
    }
    return true;
  }

  /**
   * Checks for any dependencies that must be met in order to lookup for the "required" field def rule
   * @param parent the parent of the field
   * @param fieldDef the field def to check if has any dependency to match first before its required status is enforced
   * @return {boolean} true if to enforce the "required" rule
   */
  isRequiredDependencyMet(parent, fieldDef: FieldDefinition) {
    const dependencies = fieldDef.dependencies;
    // by default is met (unless an exception), hence the workflow can proceed to validate the "required" rule
    let met = ![AC.DISASTER_RESPONSE, RC.FILE_NAME, RC.WEB_LINK].includes(fieldDef.name);
    // eslint-disable-next-line default-case
    if (dependencies && dependencies.length) {
      dependencies.forEach(dep => {
        // eslint-disable-next-line default-case
        switch (dep) {
          case AC.DEPENDENCY_ON_BUDGET:
          case AC.DEPENDENCY_PROJECT_CODE_ON_BUDGET:
            met = met && this._isActivityOnBudget();
            break;
          case AC.DEPENDENCY_TRANSACTION_PRESENT:
            met = met && this._hasTransactions(parent);
            break;
          case AC.DEPENDENCY_DISBURSEMENT_DISASTER_RESPONSE_REQUIRED:
            met = met || this._matchesTransactionType(parent, DISBURSEMENTS);
            break;
          case AC.DEPENDENCY_COMMITMENTS_DISASTER_RESPONSE_REQUIRED:
            met = met || this._matchesTransactionType(parent, COMMITMENTS);
            break;
          case RC.DEPENDENCY_RESOURCE_TYPE_LINK:
            met = met || this._matchesResourceType(parent, RC.TYPE_WEB_RESOURCE);
            break;
          case RC.DEPENDENCY_RESOURCE_TYPE_FILE:
            met = met || this._matchesResourceType(parent, RC.TYPE_DOC_RESOURCE);
            break;
        }
      });
    }
    return met;
  }

  _validateDependencies(objects, fieldPath, fieldDef: FieldDefinition) {
    const dependencies = fieldDef.dependencies;
    if (dependencies && dependencies.length) {
      const hasLocations = this._hasLocations();
      // reporting some dependency errors only for the top objects
      if (hasLocations && dependencies.includes(AC.DEPENDENCY_IMPLEMENTATION_LEVEL_PRESENT)) {
        this.processValidationResult(this._entity, AC.LOCATIONS, this._validateImplementationLevelPresent());
      }
      if (dependencies.includes(AC.DEPENDENCY_IMPLEMENTATION_LEVEL_VALID)) {
        this.processValidationResult(this._entity, AC.LOCATIONS, this._validateImplementationLevelValid());
      }
      if (hasLocations && dependencies.includes(AC.DEPENDENCY_IMPLEMENTATION_LOCATION_PRESENT)) {
        this.processValidationResult(this._entity, AC.LOCATIONS, this._validateImplementationLocationPresent());
      }
      objects.forEach(obj => {
        const hydratedValue = obj[fieldDef.name];
        if (dependencies.includes(AC.DEPENDENCY_IMPLEMENTATION_LOCATION_VALID)) {
          this.processValidationResult(obj, fieldPath, this._validateImplementationLocationValid());
        }
        if (dependencies.includes(AC.DEPENDENCY_COMPONENT_FUNDING_ORG_VALID)) {
          const validationResult = this._validateComponentFundingOrgValid(hydratedValue);
          this.processValidationResult(obj, fieldPath, validationResult);
        }
      });
    }
    // other custom validation, not yet generically defined through API
    objects.forEach(obj => {
      const fieldName = fieldDef.name;
      const hydratedValue = obj[fieldName];
      if (hydratedValue && FPC.ACTIVITY_CONTACT_PATHS.includes(fieldName)) {
        const validationResult = this._isUniquePrimaryContact(hydratedValue, fieldName);
        this.processValidationResult(this._entity, fieldName, validationResult);
      }
    });
  }

  _hasLocations() {
    return this._entity[AC.LOCATIONS] && this._entity[AC.LOCATIONS].length && this._entity[AC.LOCATIONS]
      .some(ampLoc => !!ampLoc.location);
  }

  _getImplementationLevelId() {
    return this._entity[AC.IMPLEMENTATION_LEVEL] && this._entity[AC.IMPLEMENTATION_LEVEL].id;
  }

  _validateImplementationLevelPresent() {
    const implLevelId = this._getImplementationLevelId();
    return !!implLevelId || translate('dependencyNotMet').replace('%depName%', translate('depImplLevelPresent'));
  }

  _validateImplementationLevelValid() {
    let isValid = true;
    const implLevelId = this._getImplementationLevelId();
    if (implLevelId) {
      const options = this._possibleValuesMap[AC.IMPLEMENTATION_LEVEL];
      isValid = !!options[implLevelId];
    }
    return isValid || translate('dependencyNotMet').replace('%depName%', translate('depImplLevelValid'));
  }

  _getImplementationLocation() {
    return this._entity[AC.IMPLEMENTATION_LOCATION] && this._entity[AC.IMPLEMENTATION_LOCATION].id;
  }

  _validateImplementationLocationPresent() {
    const iLocId = this._getImplementationLocation();
    return !!iLocId || translate('dependencyNotMet').replace('%depName%', translate('depImplLocPresent'));
  }

  _validateImplementationLocationValid() {
    const implLocId = this._getImplementationLocation();
    let isValid = true;
    if (implLocId) {
      const implLevelId = this._getImplementationLevelId();
      const options = this._possibleValuesMap[AC.IMPLEMENTATION_LOCATION];
      const implOption = options && options[implLocId];
      if (!implLevelId || !implOption) {
        isValid = false;
      } else {
        const implLevels = (implOption[AC.EXTRA_INFO] && implOption[AC.EXTRA_INFO][AC.IMPLEMENTATION_LEVELS_EXTRA_INFO])
          || [];
        isValid = implLevels.includes(implLevelId);
      }
    }
    return isValid || translate('invalidImplLoc');
  }

  _isActivityOnBudget() {
    const onOffBudget = this._entity[AC.ACTIVITY_BUDGET] && this._entity[AC.ACTIVITY_BUDGET].value;
    return onOffBudget && onOffBudget === ON_BUDGET;
  }

  _hasTransactions(fundingItem) {
    return fundingItem && FPC.TRANSACTION_TYPES.some(tt => fundingItem[tt] && fundingItem[tt].length);
  }

  _matchesTransactionType(fundingDetail, trnType) {
    const fundingType = fundingDetail && fundingDetail[AC.TRANSACTION_TYPE];
    return fundingType && fundingType.value === trnType;
  }

  _matchesResourceType(resource, resourceType) {
    return resource && resource[RC.RESOURCE_TYPE].id === resourceType;
  }

  _validateComponentFundingOrgValid(compFundOrg) {
    if (compFundOrg && compFundOrg.id) {
      const relOrgIds = this._getActivityOrgIds();
      if (!relOrgIds.includes(compFundOrg.id)) {
        return this._getComponentFundingOrgError(compFundOrg);
      }
    }
    return true;
  }

  /**
   * Validates if it is safe to remove an Item from a list according to any potential dependencies
   * @param listPath
   * @param item
   * @return {boolean}
   */
  validateItemRemovalFromList(listPath, item) {
    if (FPC.RELATED_ORGS_PATHS.includes(listPath)) {
      return this.validateOrgRemoval(listPath, item && item[AC.ORGANIZATION]);
    }
    return true;
  }


  /**
   * Validates if it is safe to remove an organization from related orgs
   * @param listPath
   * @param org
   * @return {boolean}
   */
  validateOrgRemoval(listPath, org) {
    let canRemove = true;
    if (this._getComponentOrgs().find(compOrg => compOrg.id === org.id)) {
      canRemove = this._getActivityOrgIds().filter(orgIds => orgIds === org.id).length > 1;
    }
    return canRemove || this._getComponentFundingOrgError(org);
  }

  _getComponentFundingOrgError(org) {
    org = PossibleValuesManager.getOptionTranslation(org);
    const currentError = translate('missingCompFundOrgs').replace('%orgNames%', org);
    return translate('dependencyNotMet').replace('%depName%', currentError);
  }

  _getComponentOrgs() {
    const components = this._entity[AC.COMPONENTS];
    const compFundingOrgs = [];
    if (components && components.length) {
      components.forEach(component => {
        const componentFundings = component[AC.COMPONENT_FUNDING];
        if (componentFundings && componentFundings.length) {
          componentFundings.forEach(funding => {
            const compOrg = funding[AC.COMPONENT_ORGANIZATION];
            if (compOrg && compOrg.id) {
              compFundingOrgs.push(compOrg);
            }
          });
        }
      });
    }
    return compFundingOrgs;
  }

  _getActivityOrgIds() {
    const activityOrgs = [];
    FPC.RELATED_ORGS_PATHS.forEach(orgRolePath => {
      const orgRoles = this._entity[orgRolePath];
      if (orgRoles) {
        activityOrgs.push(
          ...orgRoles.map(entry => entry[AC.ORGANIZATION] && entry[AC.ORGANIZATION].id).filter(el => !!el));
      }
    });
    return activityOrgs;
  }

  _isUniquePrimaryContact(contacts, contactListFieldName) {
    const isValid = contacts.filter(c => c[AC.PRIMARY_CONTACT]).length < 2;
    let error = null;
    if (!isValid) {
      const pcPath = `${contactListFieldName}~${AC.PRIMARY_CONTACT}`;
      const primaryContactLabel = this._fieldsManager.getFieldLabelTranslation(pcPath);
      error = translate('dependencyNotMet').replace('%depName%', primaryContactLabel);
    }
    return isValid || error;
  }
}
