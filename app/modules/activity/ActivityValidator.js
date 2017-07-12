/* eslint-disable class-methods-use-this */
import { HIERARCHICAL_VALUE } from '../../utils/constants/ActivityConstants';
import { DO_NOT_HYDRATE_FIELDS_LIST } from '../../utils/constants/FieldPathConstants';
import translate from '../../utils/translate';
import LoggerManager from '../../modules/util/LoggerManager';
import ActivityFieldsManager from './ActivityFieldsManager';

/**
 * Activity Validator
 * @author Nadejda Mandrescu
 */
export default class ActivityValidator {
  constructor(activityFieldsManager: ActivityFieldsManager) {
    LoggerManager.log('constructor');
    this._fieldsDef = activityFieldsManager.fieldsDef;
    this._possibleValuesMap = activityFieldsManager.possibleValuesMap;
    this._activityFieldsManager = activityFieldsManager;
  }

  areAllConstraintsMet(activity, asDraft, fieldPathsToSkipSet) {
    const errors = [];
    this._areAllConstraintsMet([activity], this._fieldsDef, asDraft, undefined, fieldPathsToSkipSet, errors);
    return errors;
  }

  _areAllConstraintsMet(objects, fieldsDef, asDraft, currentPath, fieldPathsToSkipSet, errors) {
    this._clearErrorState(objects);
    fieldsDef.forEach(fd => {
      const fieldPath = `${currentPath ? `${currentPath}~` : ''}${fd.field_name}`;
      if (!fieldPathsToSkipSet.has(fieldPath)) {
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

  _clearErrorState(objects) {
    objects.forEach(o => delete o.errors);
  }

  _addValidationError(obj, errors, fieldPath, errorMessage) {
    const error = {
      path: fieldPath,
      errorMessage
    };
    if (!obj.errors) {
      obj.errors = [];
    }
    // TODO TBD, this obj stored error can be used directly by the section to flag errors inside
    obj.errors.push(error);
    errors.push(error);
  }

  _validateRequiredField(objects, fieldDef, fieldPath, asDraft, isList, errors) {
    if (fieldDef.required === 'Y' || (fieldDef.required === 'ND' && !asDraft)) {
      objects.forEach(obj => {
        const value = obj[fieldDef.field_name];
        const invalidValue = value === undefined || value === null || value === '' || (isList && value.length === 0);
        if (invalidValue) this._addValidationError(obj, errors, fieldPath, translate('requiredField'));
      });
    }
  }

  _validateValue(objects, fieldDef, fieldPath, isList, errors) {
    const wasHydrated = !!this._possibleValuesMap[fieldPath] && !DO_NOT_HYDRATE_FIELDS_LIST.includes(fieldPath);
    const invalidValueError = translate('invalidValue');
    const invalidString = translate('invalidString');
    const stringLengthError = translate('stringTooLong').replace('%fieldName%', fieldDef.field_name);
    const invalidNumber = translate('invalidNumber');
    const invalidBoolean = translate('invalidBoolean');
    const invalidDate = translate('invalidDate');
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
            this._addValidationError(obj, errors, fieldPath, invalidValueError);
          }
        } else if (fieldDef.importable) {
          if (percentageChild) {
            const childrenValues = value
              .filter(child => child && child instanceof Object && child[percentageChild.field_name]
              && child[percentageChild.field_name] === +child[percentageChild.field_name]);
            const totError = this.totalPercentageValidator(childrenValues, percentageChild.field_name);
            if (totError !== true) {
              this._addValidationError(obj, errors, fieldPath, totError);
            }
          }
          if (uniqueConstraint) {
            const uniqueError = this.uniqueValuesValidator(value, uniqueConstraint);
            if (uniqueError !== true) {
              this._addValidationError(obj, errors, fieldPath, uniqueError);
            }
          }
          if (noMultipleValues) {
            const noMultipleValuesError = this.noMultipleValuesValidator(value, fieldDef.field_name);
            if (noMultipleValuesError !== true) {
              this._addValidationError(obj, errors, fieldPath, noMultipleValuesError);
            }
          }
          if (noParentChildMixing) {
            const idOnlyFieldPath = `${fieldPath}~${idOnlyField.field_name}`;
            const noParentChildMixingError = this.noParentChildMixing(value, idOnlyFieldPath, idOnlyField.field_name);
            if (noParentChildMixingError !== true) {
              this._addValidationError(obj, errors, fieldPath, noParentChildMixingError);
            }
          }
        }
      } else if (fieldDef.field_type === 'string') {
        if (!(typeof value === 'string' || value instanceof String)) {
          this._addValidationError(obj, errors, fieldPath, invalidString.replace('%value%', value));
        } else if (fieldDef.field_length && fieldDef.field_length < value.length) {
          this._addValidationError(obj, errors, fieldPath, stringLengthError);
        }
      } else if (fieldDef.field_type === 'long') {
        if (!Number.isInteger(value)) {
          // TODO AMPOFFLINE-448 add gs format
          this._addValidationError(obj, errors, fieldPath, invalidNumber.replace('%value%', value));
        }
      } else if (fieldDef.field_type === 'float') {
        if (value !== +value) {
          // TODO AMPOFFLINE-448 add gs format
          this._addValidationError(obj, errors, fieldPath, invalidNumber.replace('%value%', value));
        }
      } else if (fieldDef.field_type === 'boolean') {
        if (!(typeof value === 'boolean' || value instanceof Boolean)) {
          this._addValidationError(obj, errors, fieldPath, invalidBoolean.replace('%value%', value));
        }
      } else if (fieldDef.field_type === 'date') {
        // TODO AMPOFFLINE-448 add check for date format
        if (!(typeof value === 'string' || value instanceof String)) {
          // TODO AMPOFFLINE-448 add gs format
          this._addValidationError(obj, errors, fieldPath, invalidDate.replace('%value%', value));
        }
      }
      if (fieldDef.percentage === true) {
        const error = this.percentValueValidator(value, fieldPath);
        if (error !== null && error !== true) {
          this._addValidationError(obj, errors, fieldPath, error);
        }
      }
    });
  }

  /**
   * Percentage field validator
   * @param value the value to test
   * @param fieldPath full field path, used to detect field label to be used for error message
   * @return {String|boolean} String if an error detected, true if valid
   */
  percentValueValidator(value, fieldPath) {
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
    let validationError = null;
    const totalPercentage = values.reduce((totPercentage, val) => {
      totPercentage += val[fieldName] || 0;
      return totPercentage;
    }, 0);
    if (totalPercentage !== 100) {
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
    if (values && values.length > 1) {
      return translate('multipleValuesNotAllowed').replace('%fieldName%', fieldName);
    }
    return true;
  }

  noParentChildMixing(values, fieldPath, noParentChildMixingFieldName) {
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
