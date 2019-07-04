import { VERSION_PATTERN, VERSION_PATTERN_GROUPS_TO_EXTRACT } from './Constants';

/**
 * Version utilities
 * @author Nadejda Mandrescu
 */
const VersionUtils = {

  compareVersion(version1: string = '', version2: string = '') {
    const ver1Parts = this._splitIntoParts(version1);
    const ver2Parts = this._splitIntoParts(version2);
    let compareRes = 0;
    for (let idx = 0; idx < 4 && (compareRes === 0); idx++) {
      const v1p = this._getVerPartOrDefault(ver1Parts, idx);
      const v2p = this._getVerPartOrDefault(ver2Parts, idx);
      if (idx === 3) {
        // the SNAPSHOT part
        compareRes = ((v1p === null || v2p === null) && ((v1p && -1) || (v2p && 1))) || 0;
      } else {
        // eslint-disable-next-line no-nested-ternary
        compareRes = v1p < v2p ? -1 : (v1p > v2p ? 1 : 0);
      }
    }
    return compareRes;
  },

  _splitIntoParts(version) {
    const parts = version.split(VERSION_PATTERN);
    return VERSION_PATTERN_GROUPS_TO_EXTRACT.map(idx => (idx < parts.length ? parts[idx] : null));
  },

  _getVerPartOrDefault(verArray, idx) {
    if (idx < 3) {
      return idx < verArray.length ? (+verArray[idx]) : 0;
    }
    return (idx < verArray.length && verArray[idx]) || null;
  },

};

export default VersionUtils;
