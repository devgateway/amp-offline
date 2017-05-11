/* eslint-disable class-methods-use-this */
import { LANGUAGE_ENGLISH } from '../../utils/Constants';
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
    possibleValuesCollection.forEach(pv => { this._possibleValuesMap[pv.id] = pv['possible-options']; });
    this._fieldPathsEnabledStatusMap = {};
    this._lang = LANGUAGE_ENGLISH;
    this._defaultLang = LANGUAGE_ENGLISH;
    this._translationsCache = {};
    this._translationsCache[this._lang] = {};
    this.cleanup(fieldsDef);
  }

  cleanup(fieldsDef) {
    // TODO decide either to keep cleanup (here or anywhere else) or check if we need to standardize API
    fieldsDef.forEach(fd => {
      if (fd.children) {
        this.cleanup(fd.children);
      }
      if (fd.field_label) {
        Object.keys(fd.field_label).forEach(lang => { fd.field_label[lang.toLowerCase()] = fd.field_label[lang]; });
      }
    });
  }

  set currentLanguageCode(lang) {
    this._lang = lang;
    if (!this._translationsCache[this._lang]) {
      this._translationsCache[this._lang] = {};
    }
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

  _getOrInitCache(fieldPath) {
    let cached = this._translationsCache[this._lang][fieldPath];
    if (cached === undefined) {
      cached = {};
      this._translationsCache[this._lang][fieldPath] = cached;
    }
    if (cached.value === undefined) {
      cached.value = {};
    }
    return cached;
  }

  /**
   * Find the translation for the original value for the given field path, if found, otherwise returns null
   * @param fieldPath
   * @param origValue
   * @return {string|null}
   */
  getValueTranslation(fieldPath, origValue) {
    const cached = this._getOrInitCache(fieldPath);
    let trnValue = cached.value[origValue];

    if (trnValue === undefined) {
      trnValue = null; // set to null to cache null and avoid the outer "if" test later
      const options = this._possibleValuesMap[fieldPath];
      if (options) {
        // TODO update based on latest AMP API AMP-25621 solution, set to default lang value if requested lang not found
        // const option = options.find(opt => opt['orig-value'] === origValue);
        const option = Object.values(options).find(opt => opt.value === origValue);
        if (option !== undefined) {
          // TODO remove option.value once AMP-25621 is done
          trnValue = option.value[this._lang] || option.value[this._defaultLang] || option.value || origValue;
        }
      }
      // cache result
      cached.value[origValue] = trnValue;
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

  getValue(object, fieldPath, fallbackDefaultLang: true) {
    const parts = fieldPath.split('~');
    let value = object;
    parts.some(part => {
      if (value instanceof Array) {
        const newList = [];
        value.forEach(current => {
          const newElement = current[part];
          if (newElement !== undefined && newElement !== null) {
            newList.concat(newElement);
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
        if (val.value !== undefined) {
          val = value.value;
        }
        val = val[this._lang] || (fallbackDefaultLang ? val[this._defaultLang] : val) || val;
        return val;
      });
      value = value instanceof Array ? values : values[0];
    }
    return value;
  }

  areRequiredFieldsSpecified(activity, asDraft, fieldPathsToSkipSet, invalidFieldPathsSet) {
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
}
