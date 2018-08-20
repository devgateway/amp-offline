/* eslint-disable class-methods-use-this */
import {
  ACTIVITY_BUDGET,
  APPROVAL_DATE,
  APPROVAL_STATUS,
  APPROVED_BY,
  CONTACT,
  COMPONENT_FUNDING,
  COMPONENT_ORGANIZATION,
  COMPONENTS,
  DEPENDENCY_COMPONENT_FUNDING_ORG_VALID,
  DEPENDENCY_IMPLEMENTATION_LEVEL_PRESENT,
  DEPENDENCY_IMPLEMENTATION_LEVEL_VALID,
  DEPENDENCY_IMPLEMENTATION_LOCATION_PRESENT,
  DEPENDENCY_IMPLEMENTATION_LOCATION_VALID,
  DEPENDENCY_ON_BUDGET,
  DEPENDENCY_PROJECT_CODE_ON_BUDGET,
  DEPENDENCY_TRANSACTION_PRESENT,
  EXTRA_INFO,
  FUNDING_DETAILS,
  HIERARCHICAL_VALUE,
  IMPLEMENTATION_LEVEL,
  IMPLEMENTATION_LEVELS_EXTRA_INFO,
  IMPLEMENTATION_LOCATION,
  LOCATIONS,
  ORGANIZATION,
  PRIMARY_CONTACT,
  PROJECT_TITLE,
  TRANSACTION_TYPE,
  DEPENDENCY_DISBURSEMENT_DISASTER_RESPONSE_REQUIRED,
  DISASTER_RESPONSE,
  DEPENDENCY_COMMITMENTS_DISASTER_RESPONSE_REQUIRED
} from '../../utils/constants/ActivityConstants';
import {
  ACTIVITY_CONTACT_PATHS,
  DO_NOT_HYDRATE_FIELDS_LIST,
  RELATED_ORGS_PATHS,
  LIST_MAX_SIZE,
  REGEX_PATTERN,
  FIELD_NAME,
} from '../../utils/constants/FieldPathConstants';
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

const logger = new Logger('EntityValidator');

/**
 * Entity Validator
 * @author Nadejda Mandrescu
 */
export default class EntityValidator {
  constructor(entity, fieldsManager: FieldsManager, otherProjectTitles: Array,
    excludedFields = [APPROVAL_DATE, APPROVAL_STATUS, APPROVED_BY]) {
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
    logger.log('_areAllConstraintsMet');
    fieldsDef.forEach(fd => {
      const fieldPath = `${currentPath ? `${currentPath}~` : ''}${fd.field_name}`;
      this._clearErrorState(objects, fieldPath);
      if (!fieldPathsToSkipSet || !fieldPathsToSkipSet.has(fieldPath)) {
        const isList = fd.field_type === 'list';
        this._validateRequiredField(objects, fd, fieldPath, asDraft);
        this._validateDependencies(objects, fieldPath, fd);
        // once required fields are checked, exclude objects without values from further validation
        const objectsWithFDValues = objects.filter(o => o[fd.field_name] !== null && o[fd.field_name] !== undefined);
        this._validateValue(objectsWithFDValues, asDraft, fd, fieldPath, isList);
        if (isList && fd.importable === true && !this._firstLevelOnly) {
          let childrenObj = objectsWithFDValues.map(o => o[fd.field_name]);
          // isList === either an actual list or a complex object
          if (Array.isArray(childrenObj[0])) {
            childrenObj = childrenObj.reduce((curr, children) => {
              curr.push(...children);
              return curr;
            }, []);
          }
          this._areAllConstraintsMet(childrenObj, fd.children, asDraft, fieldPath, fieldPathsToSkipSet);
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

  validateField(parent, asDraft, fieldDef, mainFieldPath) {
    this._initGenericErrors();
    this.errorsCollector.clear();
    this._firstLevelOnly = true;
    this._validateField(parent, asDraft, fieldDef, mainFieldPath);
    this._firstLevelOnly = false;
    return this.errorsCollector.errors;
  }

  _validateField(parent, asDraft, fieldDef, mainFieldPath) {
    let fieldPath = mainFieldPath;
    // normally we fieldPath includes fieldDef field name, but checking it just in case
    if (fieldPath.endsWith(fieldDef.field_name)) {
      if (fieldPath === fieldDef.field_name) {
        fieldPath = '';
      } else {
        fieldPath = fieldPath.substring(0, fieldPath.length - fieldDef.field_name.length - 1);
      }
    }
    this._areAllConstraintsMet([parent], [fieldDef], asDraft, fieldPath, null);
    this._validateDependentFields(asDraft, mainFieldPath);
  }

  _validateDependentFields(asDraft, mainFieldPath) {
    // TODO going custom until we have more generic dependencies definition in API
    let dependencies = [];
    if (mainFieldPath === ACTIVITY_BUDGET) {
      dependencies = [DEPENDENCY_PROJECT_CODE_ON_BUDGET, DEPENDENCY_ON_BUDGET];
    } else if (RELATED_ORGS_PATHS.includes(mainFieldPath)) {
      dependencies = [DEPENDENCY_COMPONENT_FUNDING_ORG_VALID];
    }
    const fieldPaths = this._fieldsManager.getFieldPathsByDependencies(dependencies);
    fieldPaths.forEach(fieldPath => {
      const parentPath = fieldPath.substring(0, fieldPath.lastIndexOf('~'));
      const parent = this._fieldsManager.getValue(this._entity, parentPath);
      if (parent) {
        const fieldDef = this._fieldsManager.getFieldDef(fieldPath);
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

  _validateRequiredField(objects, fieldDef, fieldPath, asDraft) {
    logger.log('_validateRequiredField');
    let isRequired = fieldDef.required === 'Y' || (fieldDef.required === 'ND' && !asDraft);
    if (this.excludedFields.filter(f => (fieldDef.field_name === f)).length > 0) {
      isRequired = false;
    }
    if (isRequired) {
      objects.forEach(obj => {
        if (this.isRequiredDependencyMet(obj, fieldDef, fieldPath)) {
          this.processValidationResult(obj, fieldPath, this._validateRequired(obj[fieldDef.field_name], true));
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

  _validateValue(objects, asDraft, fieldDef, fieldPath, isList) {
    logger.log('_validateValue');
    const fieldLabel = this._fieldsManager.getFieldLabelTranslation(fieldPath);
    const wasHydrated = this._wasHydrated(fieldPath);
    const stringLengthError = translate('stringTooLong').replace('%fieldName%', fieldLabel);
    const percentageChild = isList && fieldDef.importable === true &&
      fieldDef.children.find(childDef => childDef.percentage === true);
    const idOnlyField = isList && fieldDef.importable === true &&
      fieldDef.children.find(childDef => childDef.id_only === true);
    const uniqueConstraint = isList && fieldDef.unique_constraint;
    const noMultipleValues = fieldDef.multiple_values !== true;
    const noParentChildMixing = fieldDef.tree_collection === true;
    const maxListSize = fieldDef[LIST_MAX_SIZE];
    const listLengthError = translate('listTooLong')
      .replace('%fieldName%', fieldLabel).replace('%sizeLimit%', maxListSize);
    const regexPattern = fieldDef[REGEX_PATTERN] ? new RegExp(fieldDef[REGEX_PATTERN]) : null;
    const regexError = this._getRegexError(regexPattern, fieldPath);
    // it could be faster to do outer checks for the type and then go through the list for each type,
    // but realistically there won't be many objects in the list, that's why opting for clear code
    objects.forEach(obj => {
      const value = this._getValue(obj, fieldDef, wasHydrated);
      if (isList) {
        if (!Array.isArray(value)) {
          // for complex objects it is also a list of properties
          if (!(value instanceof Object)) {
            this.processValidationResult(obj, fieldPath, this.invalidValueError);
          }
        } else if (fieldDef.importable) {
          if (percentageChild) {
            // similarly to AMP, we should report total error if there are % set. E.g. In Niger, Programs % is optional.
            const childrenValues = value.filter(child => child && child instanceof Object
              && this._hasValue(child[percentageChild.field_name]));
            const totError = this.totalPercentageValidator(childrenValues, percentageChild.field_name);
            this.processValidationResult(obj, fieldPath, totError);
          }
          if (uniqueConstraint) {
            this.processValidationResult(obj, fieldPath, this.uniqueValuesValidator(value, uniqueConstraint));
          }
          if (noMultipleValues) {
            const noMultipleValuesError = this.noMultipleValuesValidator(value, fieldDef.field_name);
            this.processValidationResult(obj, fieldPath, noMultipleValuesError);
          }
          if (noParentChildMixing) {
            const idOnlyFieldPath = `${fieldPath}~${idOnlyField.field_name}`;
            const noParentChildMixingError = this.noParentChildMixing(value, idOnlyFieldPath, idOnlyField.field_name);
            this.processValidationResult(obj, fieldPath, noParentChildMixingError);
          }
          if (maxListSize && value.length > maxListSize) {
            this.processValidationResult(obj, fieldPath, listLengthError);
          }
        }
      } else if (fieldDef.field_type === 'string') {
        if (this._wasValidatedSeparately(obj, fieldPath, fieldDef, asDraft)) {
          // TODO multilingual support Iteration 2+
        } else if (!(typeof value === 'string' || value instanceof String)) {
          this.processValidationResult(obj, fieldPath, this.invalidString.replace('%value%', value));
        } else {
          if (fieldDef.field_length && fieldDef.field_length < value.length) {
            this.processValidationResult(obj, fieldPath, stringLengthError);
          }
          if (fieldPath === PROJECT_TITLE) {
            this.processValidationResult(obj, fieldPath, this.projectTitleValidator(value));
          }
          if (regexPattern && !regexPattern.test(value)) {
            this.processValidationResult(obj, fieldPath, regexError);
          }
        }
      } else if (fieldDef.field_type === 'long') {
        if (!Number.isInteger(value) && !this._isAllowInvalidNumber(value, fieldPath)) {
          this.processValidationResult(obj, fieldPath, this.invalidNumber);
        } else {
          this._wasValidatedSeparately(obj, fieldPath, fieldDef, asDraft);
        }
      } else if (fieldDef.field_type === 'float') {
        if (value !== +value || value.toString().indexOf('e') > -1) {
          this.processValidationResult(obj, fieldPath, this.invalidNumber);
        }
      } else if (fieldDef.field_type === 'boolean') {
        if (!(typeof value === 'boolean' || value instanceof Boolean)) {
          this.processValidationResult(obj, fieldPath, this.invalidBoolean.replace('%value%', value));
        }
      } else if (fieldDef.field_type === 'date') {
        if (!(typeof value === 'string' || value instanceof String)
          || !(value !== '' && DateUtils.isValidDateFormat(value, INTERNAL_DATE_FORMAT))) {
          this.processValidationResult(obj, fieldPath, this.invalidDate.replace('%value%', value));
        }
      }
      if (fieldDef.percentage === true) {
        this.processValidationResult(obj, fieldPath, this.percentValueValidator(value, fieldPath));
      }
    });
  }

  _wasHydrated(fieldPath) {
    return !!this._possibleValuesMap[fieldPath] && !DO_NOT_HYDRATE_FIELDS_LIST.includes(fieldPath);
  }

  _getValue(obj, fieldDef, wasHydrated) {
    let value = obj[fieldDef.field_name];
    value = wasHydrated && value ? value.id : value;
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
    const isContactId = (parts.length === 2 && ACTIVITY_CONTACT_PATHS.includes(parts[0]) && CONTACT === parts[1]) ||
      (parts.length === 1 && this.excludedFields.includes(parts[0]));
    if (isContactId && `${value}`.startsWith(CLIENT_CHANGE_ID_PREFIX)) {
      return true;
    }
    return false;
  }

  _wasValidatedSeparately(obj, fieldPath, fieldDef, asDraft) {
    const hValue = obj[fieldDef.field_name];
    const entityValidator = hValue && hValue[VC_TMP_ENTITY_VALIDATOR];
    if (entityValidator) {
      let validationError = entityValidator.areAllConstraintsMet(entityValidator._entity, asDraft);
      validationError = validationError.length ? validationError.join('. ') : null;
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
      const id = item[fieldName].id;
      const value = item[fieldName][HIERARCHICAL_VALUE] || item[fieldName].value;
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
          childrenMixedWithParents.push(value[noParentChildMixingFieldName][HIERARCHICAL_VALUE]);
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
  isRequiredDependencyMet(parent, fieldDef) {
    const dependencies = fieldDef.dependencies;
    // by default is met (unless disaster response), hence the workflow can proceed to validate the "required" rule
    let met = DISASTER_RESPONSE !== fieldDef[FIELD_NAME];
    // eslint-disable-next-line default-case
    if (dependencies && dependencies.length) {
      dependencies.forEach(dep => {
        // eslint-disable-next-line default-case
        switch (dep) {
          case DEPENDENCY_ON_BUDGET:
          case DEPENDENCY_PROJECT_CODE_ON_BUDGET:
            met = met && this._isActivityOnBudget();
            break;
          case DEPENDENCY_TRANSACTION_PRESENT:
            met = met && this._hasTransactions(parent);
            break;
          case DEPENDENCY_DISBURSEMENT_DISASTER_RESPONSE_REQUIRED:
            met = met || this._matchesTransactionType(parent, DISBURSEMENTS);
            break;
          case DEPENDENCY_COMMITMENTS_DISASTER_RESPONSE_REQUIRED:
            met = met || this._matchesTransactionType(parent, COMMITMENTS);
            break;
        }
      });
    }
    return met;
  }

  _validateDependencies(objects, fieldPath, fieldDef) {
    const dependencies = fieldDef.dependencies;
    if (dependencies && dependencies.length) {
      const hasLocations = this._hasLocations();
      // reporting some dependency errors only for the top objects
      if (hasLocations && dependencies.includes(DEPENDENCY_IMPLEMENTATION_LEVEL_PRESENT)) {
        this.processValidationResult(this._entity, LOCATIONS, this._validateImplementationLevelPresent());
      }
      if (dependencies.includes(DEPENDENCY_IMPLEMENTATION_LEVEL_VALID)) {
        this.processValidationResult(this._entity, LOCATIONS, this._validateImplementationLevelValid());
      }
      if (hasLocations && dependencies.includes(DEPENDENCY_IMPLEMENTATION_LOCATION_PRESENT)) {
        this.processValidationResult(this._entity, LOCATIONS, this._validateImplementationLocationPresent());
      }
      objects.forEach(obj => {
        const hydratedValue = obj[fieldDef.field_name];
        if (dependencies.includes(DEPENDENCY_IMPLEMENTATION_LOCATION_VALID)) {
          this.processValidationResult(obj, fieldPath, this._validateImplementationLocationValid());
        }
        if (dependencies.includes(DEPENDENCY_COMPONENT_FUNDING_ORG_VALID)) {
          const validationResult = this._validateComponentFundingOrgValid(hydratedValue);
          this.processValidationResult(obj, fieldPath, validationResult);
        }
      });
    }
    // other custom validation, not yet generically defined through API
    objects.forEach(obj => {
      const fieldName = fieldDef.field_name;
      const hydratedValue = obj[fieldName];
      if (hydratedValue && ACTIVITY_CONTACT_PATHS.includes(fieldName)) {
        const validationResult = this._isUniquePrimaryContact(hydratedValue, fieldName);
        this.processValidationResult(this._entity, fieldName, validationResult);
      }
    });
  }

  _hasLocations() {
    return this._entity[LOCATIONS] && this._entity[LOCATIONS].length && this._entity[LOCATIONS]
      .some(ampLoc => !!ampLoc.location);
  }

  _getImplementationLevelId() {
    return this._entity[IMPLEMENTATION_LEVEL] && this._entity[IMPLEMENTATION_LEVEL].id;
  }

  _validateImplementationLevelPresent() {
    const implLevelId = this._getImplementationLevelId();
    return !!implLevelId || translate('dependencyNotMet').replace('%depName%', translate('depImplLevelPresent'));
  }

  _validateImplementationLevelValid() {
    let isValid = true;
    const implLevelId = this._getImplementationLevelId();
    if (implLevelId) {
      const options = this._possibleValuesMap[IMPLEMENTATION_LEVEL];
      isValid = !!options[implLevelId];
    }
    return isValid || translate('dependencyNotMet').replace('%depName%', translate('depImplLevelValid'));
  }

  _getImplementationLocation() {
    return this._entity[IMPLEMENTATION_LOCATION] && this._entity[IMPLEMENTATION_LOCATION].id;
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
      const options = this._possibleValuesMap[IMPLEMENTATION_LOCATION];
      const implOption = options && options[implLocId];
      if (!implLevelId || !implOption) {
        isValid = false;
      } else {
        const implLevels = (implOption[EXTRA_INFO] && implOption[EXTRA_INFO][IMPLEMENTATION_LEVELS_EXTRA_INFO]) || [];
        isValid = implLevels.includes(implLevelId);
      }
    }
    return isValid || translate('invalidImplLoc');
  }

  _isActivityOnBudget() {
    const onOffBudget = this._entity[ACTIVITY_BUDGET] && this._entity[ACTIVITY_BUDGET].value;
    return onOffBudget && onOffBudget === ON_BUDGET;
  }

  _hasTransactions(fundingItem) {
    const fundingDetails = fundingItem && fundingItem[FUNDING_DETAILS];
    return fundingDetails && fundingDetails.length;
  }

  _matchesTransactionType(fundingDetail, trnType) {
    const fundingType = fundingDetail && fundingDetail[TRANSACTION_TYPE];
    return fundingType && fundingType.value === trnType;
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
    if (RELATED_ORGS_PATHS.includes(listPath)) {
      return this.validateOrgRemoval(listPath, item && item[ORGANIZATION]);
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
    const components = this._entity[COMPONENTS];
    const compFundingOrgs = [];
    if (components && components.length) {
      components.forEach(component => {
        const componentFundings = component[COMPONENT_FUNDING];
        if (componentFundings && componentFundings.length) {
          componentFundings.forEach(funding => {
            const compOrg = funding[COMPONENT_ORGANIZATION];
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
    RELATED_ORGS_PATHS.forEach(orgRolePath => {
      const orgRoles = this._entity[orgRolePath];
      if (orgRoles) {
        activityOrgs.push(...orgRoles.map(entry => entry[ORGANIZATION] && entry[ORGANIZATION].id).filter(el => !!el));
      }
    });
    return activityOrgs;
  }

  _isUniquePrimaryContact(contacts, contactListFieldName) {
    const isValid = contacts.filter(c => c[PRIMARY_CONTACT]).length < 2;
    let error = null;
    if (!isValid) {
      const pcPath = `${contactListFieldName}~${PRIMARY_CONTACT}`;
      const primaryContactLabel = this._fieldsManager.getFieldLabelTranslation(pcPath);
      error = translate('dependencyNotMet').replace('%depName%', primaryContactLabel);
    }
    return isValid || error;
  }
}
