import { LANGUAGE_ENGLISH } from '../../utils/Constants';
/**
 * This is a helper class for checking fields status, getting field options translations and the like.
 * @author Nadejda Mandrescu
 */
export default class ActivityFieldsManager {
  constructor(fieldsDef, possibleValuesCollection) {
    console.log('constructor');
    this._fieldsDef = fieldsDef;
    this._possibleValuesMap = new Map(possibleValuesCollection.map(pv => [pv.id, pv['possible-options']]));
    this._fieldPathsEnabledStatusMap = {};
    this._translationsCache = {};
    this._lang = LANGUAGE_ENGLISH;
    this._defaultLang = LANGUAGE_ENGLISH;
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

  getTranslation(fieldPath, origValue) {
    return this.getTranslationForLanguage(fieldPath, origValue, this._lang, this._defaultLang);
  }

  /**
   * Find the translation for the original value for the given field path, if found, otherwise returns null
   * @param fieldPath
   * @param origValue
   * @param lang
   * @param defaultLang
   * @return {string|null}
   */
  getTranslationForLanguage(fieldPath, origValue, lang, defaultLang) {
    let trnValue;
    let cached = this._translationsCache[fieldPath];
    if (cached) {
      trnValue = cached[origValue];
    }

    if (trnValue === undefined) {
      trnValue = null; // set to null to cache null and avoid the outer "if" test later
      const options = this._possibleValuesMap[fieldPath];
      if (options) {
        // TODO update based on latest AMP API AMP-25621 solution, set to default lang value if requested lang not found
        // const option = options.find(opt => opt['orig-value'] === origValue);
        const option = options.find(opt => opt.value === origValue);
        if (option !== undefined) {
          // TODO remove option.value once AMP-25621 is done
          trnValue = option.value || option.value[lang] || option.value[defaultLang] || origValue;
        }
        // cache result
        if (cached === undefined) {
          cached = {};
        }
        cached[origValue] = trnValue;
        this._translationsCache[fieldPath] = cached;
      } else {
        // TODO this is a temporary workaround for AMP-25752, remove once AMP-25752 is fixed
        trnValue = origValue;
      }
    }
    return trnValue;
  }
}
