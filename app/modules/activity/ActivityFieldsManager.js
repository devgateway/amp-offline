/* eslint-disable class-methods-use-this */
import { LANGUAGE_ENGLISH } from '../../utils/Constants';
import { HIERARCHICAL_VALUE } from '../../utils/constants/ActivityConstants';
import PossibleValuesManager from './PossibleValuesManager';
import translate from '../../utils/translate';
import LoggerManager from '../../modules/util/LoggerManager';

/**
 * This is a helper class for checking fields status, getting field options translations and the like.
 * @author Nadejda Mandrescu
 */
export default class ActivityFieldsManager {
  /**
   * Shallow clone of another activityFieldsManager
   * @param activityFieldsManager
   * @return {ActivityFieldsManager}
   */
  static clone(activityFieldsManager: ActivityFieldsManager) {
    const newActivityFieldsManager = new ActivityFieldsManager([], []);
    Object.assign(newActivityFieldsManager, activityFieldsManager);
    return newActivityFieldsManager;
  }

  constructor(fieldsDef, possibleValuesCollection) {
    // TODO remove cache
    LoggerManager.log('constructor');
    this._fieldsDef = fieldsDef;
    this._possibleValuesMap = {};
    possibleValuesCollection.forEach(pv => {
      this._possibleValuesMap[pv.id] = pv['possible-options'];
    });
    this._fieldPathsEnabledStatusMap = {};
    this._lang = LANGUAGE_ENGLISH;
    this._defaultLang = LANGUAGE_ENGLISH;
    this.cleanup(fieldsDef);
  }

  cleanup(fieldsDef) {
    // TODO decide either to keep cleanup (here or anywhere else) or check if we need to standardize API
    fieldsDef.forEach(fd => {
      if (fd.children) {
        this.cleanup(fd.children);
      }
      if (fd.field_label) {
        Object.keys(fd.field_label).forEach(lang => {
          fd.field_label[lang.toLowerCase()] = fd.field_label[lang];
        });
      }
    });
  }

  set currentLanguageCode(lang) {
    this._lang = lang;
  }

  set defaultLanguageCode(lang) {
    this._defaultLang = lang;
  }

  get fieldsDef() {
    return this._fieldsDef;
  }

  get possibleValuesMap() {
    return this._possibleValuesMap;
  }

  /**
   * Checks if the specified field path is enabled in AMP FM
   * @param fieldPath
   * @return {boolean}
   */
  isFieldPathEnabled(fieldPath) {
    if (this._fieldPathsEnabledStatusMap[fieldPath] === undefined) {
      this._buildFieldPathStatus(fieldPath);
    }
    return this._fieldPathsEnabledStatusMap[fieldPath];
  }

  _buildFieldPathStatus(fieldPath) {
    const pathParts = fieldPath.split('~');
    let currentTree = this._fieldsDef;
    const isDisabled = pathParts.some(part => {
      currentTree = currentTree.find(field => field.field_name === part);
      if (currentTree) {
        if (currentTree.field_type === 'list') {
          currentTree = currentTree.children;
        }
        return false;
      }
      return true;
    });
    this._fieldPathsEnabledStatusMap[fieldPath] = !isDisabled;
  }

  /**
   * Find the translation for the original value for the given field path, if found, otherwise returns null
   * @param fieldPath
   * @param origValue
   * @return {string|null}
   */
  getValueTranslation(fieldPath, origValue) {
    // fallback to original untranslated value
    let trnValue = origValue;
    const options = this._possibleValuesMap[fieldPath];
    if (options) {
      const option = Object.values(options).find(opt => opt.value === origValue);
      if (option !== undefined) {
        const translations = option['translated-value'];
        if (translations) {
          trnValue = translations[this._lang] || translations[this._defaultLang] || trnValue;
        }
      }
    }
    return trnValue;
  }

  getFieldLabelTranslation(fieldPath) {
    let trnLabel = null;
    const fieldsDef = this.getFieldDef(fieldPath);
    if (fieldsDef !== undefined) {
      trnLabel = fieldsDef.field_label[this._lang] || fieldsDef.field_label[this._defaultLang] || null;
    }
    return trnLabel;
  }

  getFieldDef(fieldPath) {
    let fieldsDef = this._fieldsDef;
    fieldPath.split('~').some(part => {
      if (!(fieldsDef instanceof Array)) {
        fieldsDef = fieldsDef.children;
      }
      fieldsDef = fieldsDef.find(fd => fd.field_name === part);
      return fieldsDef === undefined;
    });
    return fieldsDef;
  }

  getValue(object, fieldPath) {
    return ActivityFieldsManager.getValue(object, fieldPath);
  }

  static getValue(object, fieldPath) {
    const parts = fieldPath ? fieldPath.split('~') : [];
    let value = object;
    parts.some(part => {
      if (value instanceof Array) {
        const newList = [];
        value.forEach(current => {
          const newElement = current[part];
          if (newElement !== undefined && newElement !== null) {
            newList.push(newElement);
          }
        });
        value = newList;
      } else {
        value = value[part];
      }
      return value === undefined || value === null || value.length === 0;
    });
    if (value !== undefined && value !== null && value.length !== 0) {
      let values = [].concat(value);
      values = values.map(val => {
        if (val.value === undefined) {
          return val;
        }
        return PossibleValuesManager.getOptionTranslation(val, this._lang, this._defaultLang);
      });
      value = value instanceof Array ? values : values[0];
    }
    return value;
  }

  areRequiredFieldsSpecified(activity, asDraft, fieldPathsToSkipSet, invalidFieldPathsSet) {
    // TODO collect other validation errors, like % validation
    return !this._hasRequiredFieldsUnspecified([activity], this.fieldsDef, asDraft, undefined, fieldPathsToSkipSet,
      invalidFieldPathsSet);
  }

  _hasRequiredFieldsUnspecified(objects, fieldsDef, asDraft, currentPath, fieldPathsToSkipSet, invalidFieldPathsSet) {
    return fieldsDef.some(fd => {
      const fieldPath = `${currentPath ? `${currentPath}~` : ''}${fd.field_name}`;
      if ((fd.required === 'Y' || (fd.required === 'ND' && !asDraft)) && !fieldPathsToSkipSet.has(fieldPath)) {
        const isList = fd.field_type === 'list';
        const children = [];
        let hasObjectsWithoutValue = objects.some(obj => {
          const value = obj[fd.field_name];
          const invalidValue = value === undefined || value === null || value === '' || (isList && value.length === 0);
          if (!invalidValue && isList) {
            children.concat(value);
          }
          return invalidValue; // array.some will stop when first invalid value is found
        });
        if (hasObjectsWithoutValue) {
          invalidFieldPathsSet.add(fieldPath);
        } else if (children.length > 0) {
          hasObjectsWithoutValue = this._hasRequiredFieldsUnspecified(children, fd.children, asDraft, fieldPath,
            fieldPathsToSkipSet, invalidFieldPathsSet);
        }
        return hasObjectsWithoutValue;
      }
      return false;
    });
  }

  areAllConstraintsMet(activity, asDraft, fieldPathsToSkipSet) {
    const errors = [];
    this._areAllConstraintsMet([activity], this.fieldsDef, asDraft, undefined, fieldPathsToSkipSet, errors);
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
        if (invalidValue) {
          this._addValidationError(obj, errors, fieldPath, translate('requiredField'));
        }
      });
    }
  }

  _validateValue(objects, fieldDef, fieldPath, isList, errors) {
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
      const value = obj[fieldDef.field_name];
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
            const noParentChildMixingError = this.noParentChildMixing(value, fieldPath, idOnlyField.field_name);
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
        if (!Number.isInteger(fieldDef.id_only === true ? value.id : value)) {
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
      const fieldLabel = this.getFieldLabelTranslation(fieldPath);
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
   * Unique values valodator
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
    const options = this.possibleValuesMap[fieldPath];
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
