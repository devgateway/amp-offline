/* eslint-disable class-methods-use-this */
import {
  ACTIVITY_BUDGET,
  APPROVAL_DATE,
  APPROVAL_STATUS,
  APPROVED_BY,
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
  PROJECT_TITLE
} from '../../utils/constants/ActivityConstants';
import { DO_NOT_HYDRATE_FIELDS_LIST } from '../../utils/constants/FieldPathConstants';
import { DEFAULT_DATE_FORMAT, GS_DEFAULT_NUMBER_FORMAT } from '../../utils/constants/GlobalSettingsConstants';
import { INTERNAL_DATE_FORMAT } from '../../utils/Constants';
import translate from '../../utils/translate';
import Logger from '../../modules/util/LoggerManager';
import GlobalSettingsManager from '../../modules/util/GlobalSettingsManager';
import DateUtils from '../../utils/DateUtils';
import ActivityFieldsManager from './ActivityFieldsManager';
import { ON_BUDGET } from '../../utils/constants/ValueConstants';

const logger = new Logger('Activity validator');

/**
 * Activity Validator
 * @author Nadejda Mandrescu
 */
export default class ActivityValidator {
  constructor(activity, activityFieldsManager: ActivityFieldsManager, otherProjectTitles: Array) {
    logger.log('constructor');
    this._activity = activity;
    this._fieldsDef = activityFieldsManager.fieldsDef;
    this._possibleValuesMap = activityFieldsManager.possibleValuesMap;
    this._activityFieldsManager = activityFieldsManager;
    this._otherProjectTitles = new Set(otherProjectTitles);
    this.excludedFields = [APPROVAL_DATE, APPROVAL_STATUS, APPROVED_BY];
  }

  set activity(activity) {
    this._activity = activity;
  }

  areAllConstraintsMet(activity, asDraft, fieldPathsToSkipSet) {
    logger.log('areAllConstraintsMet');
    const errors = [];
    this._initGenericErrors();
    this._areAllConstraintsMet([activity], this._fieldsDef, asDraft, undefined, fieldPathsToSkipSet, errors);
    return errors;
  }

  _areAllConstraintsMet(objects, fieldsDef, asDraft, currentPath, fieldPathsToSkipSet, errors) {
    logger.log('_areAllConstraintsMet');
    fieldsDef.forEach(fd => {
      const fieldPath = `${currentPath ? `${currentPath}~` : ''}${fd.field_name}`;
      this._clearErrorState(objects, fieldPath);
      if (!fieldPathsToSkipSet || !fieldPathsToSkipSet.has(fieldPath)) {
        const isList = fd.field_type === 'list';
        this._validateRequiredField(objects, fd, fieldPath, asDraft, isList, errors);
        this._validateDependencies(objects, errors, fieldPath, fd);
        // once required fields are checked, exclude objects without values from further validation
        const objectsWithFDValues = objects.filter(o => o[fd.field_name] !== null && o[fd.field_name] !== undefined);
        this._validateValue(objectsWithFDValues, fd, fieldPath, isList, errors);
        if (isList && fd.importable === true) {
          let childrenObj = objectsWithFDValues.map(o => o[fd.field_name]);
          // isList === either an actual list or a complex object
          if (Array.isArray(childrenObj[0])) {
            childrenObj = childrenObj.reduce((curr, children) => {
              curr.push(...children);
              return curr;
            }, []);
          }
          this._areAllConstraintsMet(childrenObj, fd.children, asDraft, fieldPath,
            fieldPathsToSkipSet, errors);
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

  processValidationResult(parent, errors, fieldPath, validationResult) {
    if (validationResult === true || validationResult === null) return;
    const error = {
      path: fieldPath,
      errorMessage: validationResult,
      parent
    };
    if (!parent.errors) {
      parent.errors = [];
    }
    parent.errors.push(error);
    errors.push(error);
  }

  validateField(parent, asDraft, fieldDef, mainFieldPath) {
    let fieldPath = mainFieldPath;
    this._initGenericErrors();
    // normally we fieldPath includes fieldDef field name, but checking it just in case
    if (fieldPath.endsWith(fieldDef.field_name)) {
      if (fieldPath === fieldDef.field_name) {
        fieldPath = '';
      } else {
        fieldPath = fieldPath.substring(0, fieldPath.length - fieldDef.field_name.length - 1);
      }
    }
    const errors = [];
    this._areAllConstraintsMet([parent], [fieldDef], asDraft, fieldPath, null, errors);
    errors.push(...this._validateDependentFields(asDraft, mainFieldPath));
    return errors;
  }

  _validateDependentFields(asDraft, mainFieldPath) {
    // TODO going custom until we have more generic dependencies definition in API
    const errors = [];
    let dependencies = [];
    if (mainFieldPath === ACTIVITY_BUDGET) {
      dependencies = [DEPENDENCY_PROJECT_CODE_ON_BUDGET, DEPENDENCY_ON_BUDGET];
    }
    const fieldPaths = this._activityFieldsManager.getFieldPathsByDependencies(dependencies);
    fieldPaths.forEach(fieldPath => {
      const parentPath = fieldPath.substring(0, fieldPath.lastIndexOf('~'));
      const parent = this._activityFieldsManager.getValue(this._activity, parentPath);
      const fieldDef = this._activityFieldsManager.getFieldDef(fieldPath);
      errors.push(...this.validateField(parent, asDraft, fieldDef, fieldPath));
    });
    return errors;
  }

  _validateValueIfRequired(value, asDraft, fieldDef) {
    const isRequired = (fieldDef.required === 'Y' || (fieldDef.required === 'ND' && asDraft === false));
    return this._validateRequired(value, isRequired);
  }

  _validateRequired(value, isRequired) {
    const invalidValue = isRequired &&
      (value === undefined || value === null || value === '' || (value.length !== undefined && value.length === 0));
    return invalidValue ? translate('requiredField') : true;
  }

  _validateRequiredField(objects, fieldDef, fieldPath, asDraft, isList, errors) {
    logger.log('_validateRequiredField');
    let isRequired = fieldDef.required === 'Y' || (fieldDef.required === 'ND' && !asDraft);
    if (this.excludedFields.filter(f => (fieldDef.field_name === f)).length > 0) {
      isRequired = false;
    }
    if (isRequired) {
      objects.forEach(obj => {
        this.processValidationResult(obj, errors, fieldPath, this._validateRequired(obj[fieldDef.field_name], true));
      });
    }
  }

  _initGenericErrors() {
    const gsNumberFormat = GlobalSettingsManager.getSettingByKey(GS_DEFAULT_NUMBER_FORMAT);
    const gsDateFormat = GlobalSettingsManager.getSettingByKey(DEFAULT_DATE_FORMAT);
    this.invalidValueError = translate('invalidValue');
    this.invalidString = translate('invalidString');
    this.invalidNumber = translate('invalidNumber').replace('%gs-format%', gsNumberFormat);
    this.invalidBoolean = translate('invalidBoolean');
    this.invalidTitle = translate('duplicateTitle');
    // though we'll validate internal format, we have to report user friendly format
    this.invalidDate = translate('invalidDate').replace('%gs-format%', gsDateFormat);
  }

  _validateValue(objects, fieldDef, fieldPath, isList, errors) {
    logger.log('_validateValue');
    const fieldLabel = this._activityFieldsManager.getFieldLabelTranslation(fieldPath);
    const wasHydrated = this._wasHydrated(fieldPath);
    const stringLengthError = translate('stringTooLong').replace('%fieldName%', fieldLabel);
    const percentageChild = isList && fieldDef.importable === true &&
      fieldDef.children.find(childDef => childDef.percentage === true);
    const idOnlyField = isList && fieldDef.importable === true &&
      fieldDef.children.find(childDef => childDef.id_only === true);
    const uniqueConstraint = isList && fieldDef.unique_constraint;
    const noMultipleValues = fieldDef.multiple_values !== true;
    const noParentChildMixing = fieldDef.tree_collection === true;
    // it could be faster to do outer checks for the type and then go through the list for each type,
    // but realistically there won't be many objects in the list, that's why opting for clear code
    objects.forEach(obj => {
      const value = this._getValue(obj, fieldDef, wasHydrated);
      if (isList) {
        if (!Array.isArray(value)) {
          // for complex objects it is also a list of properties
          if (!(value instanceof Object)) {
            this.processValidationResult(obj, errors, fieldPath, this.invalidValueError);
          }
        } else if (fieldDef.importable) {
          if (percentageChild) {
            // similarly to AMP, we should report total error if there are % set. E.g. In Niger, Programs % is optional.
            const childrenValues = value.filter(child => child && child instanceof Object
              && this._hasValue(child[percentageChild.field_name]));
            const totError = this.totalPercentageValidator(childrenValues, percentageChild.field_name);
            this.processValidationResult(obj, errors, fieldPath, totError);
          }
          if (uniqueConstraint) {
            this.processValidationResult(obj, errors, fieldPath, this.uniqueValuesValidator(value, uniqueConstraint));
          }
          if (noMultipleValues) {
            const noMultipleValuesError = this.noMultipleValuesValidator(value, fieldDef.field_name);
            this.processValidationResult(obj, errors, fieldPath, noMultipleValuesError);
          }
          if (noParentChildMixing) {
            const idOnlyFieldPath = `${fieldPath}~${idOnlyField.field_name}`;
            const noParentChildMixingError = this.noParentChildMixing(value, idOnlyFieldPath, idOnlyField.field_name);
            this.processValidationResult(obj, errors, fieldPath, noParentChildMixingError);
          }
        }
      } else if (fieldDef.field_type === 'string') {
        // TODO multilingual support Iteration 2+
        if (!(typeof value === 'string' || value instanceof String)) {
          this.processValidationResult(obj, errors, fieldPath, this.invalidString.replace('%value%', value));
        } else if (fieldDef.field_length && fieldDef.field_length < value.length) {
          this.processValidationResult(obj, errors, fieldPath, stringLengthError);
        } else if (fieldPath === PROJECT_TITLE) {
          this.processValidationResult(obj, errors, fieldPath, this.projectTitleValidator(value));
        }
      } else if (fieldDef.field_type === 'long') {
        if (!Number.isInteger(value)) {
          this.processValidationResult(obj, errors, fieldPath, this.invalidNumber.replace('%value%', value));
        }
      } else if (fieldDef.field_type === 'float') {
        if (value !== +value) {
          this.processValidationResult(obj, errors, fieldPath, this.invalidNumber.replace('%value%', value));
        }
      } else if (fieldDef.field_type === 'boolean') {
        if (!(typeof value === 'boolean' || value instanceof Boolean)) {
          this.processValidationResult(obj, errors, fieldPath, this.invalidBoolean.replace('%value%', value));
        }
      } else if (fieldDef.field_type === 'date') {
        if (!(typeof value === 'string' || value instanceof String)
          || !(value !== '' && DateUtils.isValidDateFormat(value, INTERNAL_DATE_FORMAT))) {
          this.processValidationResult(obj, errors, fieldPath, this.invalidDate.replace('%value%', value));
        }
      }
      if (fieldDef.percentage === true) {
        this.processValidationResult(obj, errors, fieldPath, this.percentValueValidator(value, fieldPath));
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
      const fieldLabel = this._activityFieldsManager.getFieldLabelTranslation(fieldPath);
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
      const value = item[fieldName][HIERARCHICAL_VALUE] || item[fieldName]._value;
      if (unique.has(value)) {
        repeating.add(value);
      } else {
        unique.add(value);
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
      const friendlyFieldName = this._activityFieldsManager.getFieldLabelTranslation(fieldName);
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

  _validateDependencies(objects, errors, fieldPath, fieldDef) {
    const dependencies = fieldDef.dependencies;
    if (dependencies && dependencies.length) {
      const hasLocations = this._hasLocations();
      // reporting some dependency errors only for the top objects
      if (hasLocations && dependencies.includes(DEPENDENCY_IMPLEMENTATION_LEVEL_PRESENT)) {
        this.processValidationResult(this._activity, errors, LOCATIONS, this._validateImplementationLevelPresent());
      }
      if (dependencies.includes(DEPENDENCY_IMPLEMENTATION_LEVEL_VALID)) {
        this.processValidationResult(this._activity, errors, LOCATIONS, this._validateImplementationLevelValid());
      }
      if (hasLocations && dependencies.includes(DEPENDENCY_IMPLEMENTATION_LOCATION_PRESENT)) {
        this.processValidationResult(this._activity, errors, LOCATIONS, this._validateImplementationLocationPresent());
      }
      objects.forEach(obj => {
        const value = this._getValue(obj, fieldDef, this._wasHydrated(fieldPath));
        if (dependencies.includes(DEPENDENCY_IMPLEMENTATION_LOCATION_VALID)) {
          this.processValidationResult(obj, errors, fieldPath, this._validateImplementationLocationValid());
        }
        if (dependencies.includes(DEPENDENCY_ON_BUDGET)) {
          // TODO based on AMP-27099 outcome, we may need to switch back to _validateOnBudgetRequiredOtherwiseNotAllowed
          this.processValidationResult(obj, errors, fieldPath, this._validateOnBudgetRequiredOtherwiseAllowed(value));
        }
        if (dependencies.includes(DEPENDENCY_PROJECT_CODE_ON_BUDGET)) {
          this.processValidationResult(obj, errors, fieldPath, this._validateOnBudgetRequiredOtherwiseAllowed(value));
        }
        if (dependencies.includes(DEPENDENCY_TRANSACTION_PRESENT)) {
          this.processValidationResult(obj, errors, fieldPath, this._validateAsRequiredIfHasTransactions(value, obj));
        }
      });
    }
  }

  _hasLocations() {
    return this._activity[LOCATIONS] && this._activity[LOCATIONS].length && this._activity[LOCATIONS]
      .some(ampLoc => !!ampLoc.location);
  }

  _getImplementationLevelId() {
    return this._activity[IMPLEMENTATION_LEVEL] && this._activity[IMPLEMENTATION_LEVEL].id;
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
    return this._activity[IMPLEMENTATION_LOCATION] && this._activity[IMPLEMENTATION_LOCATION].id;
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

  _validateOnBudgetRequiredOtherwiseNotAllowed(value) {
    const validOrError = this._validateOnBudgetOrErrorLabel(value);
    return validOrError === true || translate(validOrError);
  }

  _validateOnBudgetRequiredOtherwiseAllowed(value) {
    let validOrError = this._validateOnBudgetOrErrorLabel(value);
    if (validOrError === 'notConfigurable') {
      // following AMP validation rules, when a field like project_code may be optionally be present
      validOrError = true;
    }
    return validOrError === true || translate(validOrError);
  }

  _validateOnBudgetOrErrorLabel(value) {
    const onOffBudget = this._activity[ACTIVITY_BUDGET] && this._activity[ACTIVITY_BUDGET].value;
    const isOnBudget = onOffBudget && onOffBudget === ON_BUDGET;
    const requiredAndNotConfigured = isOnBudget && !value;
    const isValid = !!((isOnBudget && value) || (!isOnBudget && !value));
    const errLabel = requiredAndNotConfigured ? 'requiredField' : 'notConfigurable';
    return isValid || errLabel;
  }

  _validateAsRequiredIfHasTransactions(value, fundingItem) {
    const fundingDetails = fundingItem && fundingItem[FUNDING_DETAILS];
    const hasFundings = fundingDetails && fundingDetails.length;
    const isValid = !hasFundings || !!value;
    return isValid || translate('requiredField');
  }
}
