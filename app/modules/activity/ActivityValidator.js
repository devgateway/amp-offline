/* eslint-disable class-methods-use-this */
import { HIERARCHICAL_VALUE, PROJECT_TITLE } from '../../utils/constants/ActivityConstants';
import { DO_NOT_HYDRATE_FIELDS_LIST } from '../../utils/constants/FieldPathConstants';
import { GS_DEFAULT_NUMBER_FORMAT, DEFAULT_DATE_FORMAT } from '../../utils/constants/GlobalSettingsConstants';
import { INTERNAL_DATE_FORMAT } from '../../utils/Constants';
import translate from '../../utils/translate';
import LoggerManager from '../../modules/util/LoggerManager';
import GlobalSettingsManager from '../../modules/util/GlobalSettingsManager';
import DateUtils from '../../utils/DateUtils';
import ActivityFieldsManager from './ActivityFieldsManager';

/**
 * Activity Validator
 * @author Nadejda Mandrescu
 */
export default class ActivityValidator {
  constructor(activityFieldsManager: ActivityFieldsManager, otherProjectTitles: Array) {
    LoggerManager.log('constructor');
    this._fieldsDef = activityFieldsManager.fieldsDef;
    this._possibleValuesMap = activityFieldsManager.possibleValuesMap;
    this._activityFieldsManager = activityFieldsManager;
    this._otherProjectTitles = new Set(otherProjectTitles);
  }

  areAllConstraintsMet(activity, asDraft, fieldPathsToSkipSet) {
    LoggerManager.log('areAllConstraintsMet');
    const errors = [];
    this._initGenericErrors();
    this._areAllConstraintsMet([activity], this._fieldsDef, asDraft, undefined, fieldPathsToSkipSet, errors);
    return errors;
  }

  _areAllConstraintsMet(objects, fieldsDef, asDraft, currentPath, fieldPathsToSkipSet, errors) {
    LoggerManager.log('_areAllConstraintsMet');
    fieldsDef.forEach(fd => {
      const fieldPath = `${currentPath ? `${currentPath}~` : ''}${fd.field_name}`;
      this._clearErrorState(objects, fieldPath);
      if (!fieldPathsToSkipSet || !fieldPathsToSkipSet.has(fieldPath)) {
        const isList = fd.field_type === 'list';
        this._validateRequiredField(objects, fd, fieldPath, asDraft, isList, errors);
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
      errorMessage: validationResult
    };
    if (!parent.errors) {
      parent.errors = [];
    }
    parent.errors.push(error);
    errors.push(error);
  }

  validateField(obj, asDraft, fieldDef, fieldPath) {
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
    this._areAllConstraintsMet([obj], [fieldDef], asDraft, fieldPath, null, errors);
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
    LoggerManager.log('_validateRequiredField');
    const isRequired = fieldDef.required === 'Y' || (fieldDef.required === 'ND' && !asDraft);
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
    LoggerManager.log('_validateValue');
    const fieldLabel = this._activityFieldsManager.getFieldLabelTranslation(fieldPath);
    const wasHydrated = !!this._possibleValuesMap[fieldPath] && !DO_NOT_HYDRATE_FIELDS_LIST.includes(fieldPath);
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
      let value = obj[fieldDef.field_name];
      value = wasHydrated && value ? value.id : value;
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

  _hasValue(value) {
    return value !== null && value !== undefined && value !== '';
  }

  projectTitleValidator(value) {
    LoggerManager.log('projectTitleValidator');
    return !this._otherProjectTitles.has(value) || this.invalidTitle;
  }

  /**
   * Percentage field validator
   * @param value the value to test
   * @param fieldPath full field path, used to detect field label to be used for error message
   * @return {String|boolean} String if an error detected, true if valid
   */
  percentValueValidator(value, fieldPath) {
    LoggerManager.log('percentValueValidator');
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
    LoggerManager.log('totalPercentageValidator');
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
    LoggerManager.log('uniqueValuesValidator');
    let validationError = null;
    const repeating = new Set();
    const unique = new Set();
    values.forEach(item => {
      const value = item[fieldName][HIERARCHICAL_VALUE];
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
    LoggerManager.log('noMultipleValuesValidator');
    if (values && values.length > 1) {
      return translate('multipleValuesNotAllowed').replace('%fieldName%', fieldName);
    }
    return true;
  }

  noParentChildMixing(values, fieldPath, noParentChildMixingFieldName) {
    LoggerManager.log('noParentChildMixing');
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
}
