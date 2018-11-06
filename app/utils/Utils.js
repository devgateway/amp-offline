import os from 'os';
import {
  ARCH32,
  ARCH64,
  ARCH64_NODE_OS_OPTIONS,
  ARCH64_USER_AGENT_OPTIONS,
  PLATFORM_DEBIAN,
  PLATFORM_MAC_OS,
  PLATFORM_REDHAT,
  PLATFORM_WINDOWS
} from '../modules/connectivity/AmpApiConstants';
import { RELEASE_BRANCHES, ENDS_WITH_PUNCTUATION_REGEX, VERSION } from './Constants';

const Utils = {

  stringToId(string: string) {
    string = string || '';
    let hash = 5381;
    for (let i = string.length - 1; i >= 0; i--) {
      /* eslint-disable no-bitwise */
      hash = (hash * 33) ^ string.charCodeAt(i);
    }
    return hash >>> 0;
    /* eslint-enable no-bitwise */
  },

  /**
   * Generates a unique id for each call, over the same string
   * @param string
   * @return {string}
   */
  stringToUniqueId(string: string) {
    return `${this.stringToId(string)}-${Date.now()}-${Math.random().toString().substring(2)}`;
  },

  numberRandom() {
    return Math.trunc((Math.random() * 1000000));
  },

  hexBufferToString(buffer) {
    // See https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
    const hexCodes = [];
    const view = new DataView(buffer);
    for (let i = 0; i < view.byteLength; i += 4) {
      // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
      const value = view.getUint32(i);
      // toString(16) will give the hex representation of the number without padding
      const stringValue = value.toString(16);
      // We use concatenation and slice for padding
      const padding = '00000000';
      const paddedValue = (padding + stringValue).slice(-padding.length);
      hexCodes.push(paddedValue);
    }
    // Join all the hex strings into one
    return hexCodes.join('');
  },

  toMap(key, value) {
    const result = {};
    result[key] = value;
    return result;
  },

  toDefinedOrNullRule(key) {
    const result = {};
    result[key] = { $exists: true };
    return result;
  },

  toDefinedNotNullRule(key) {
    return { $and: [this.toMap(key, { $exists: true }), this.toMap(key, { $ne: null })] };
  },

  /**
   * Expects a list of map elements that contain ids and extracts those ids into a flatten list
   * @param listOfMap a list of map elements, each having id field e.g. [ { id: 1, ...}, { id: 2,... }, ...]
   * @return flatten list of ids, e.g. [1, 2, ...]
   */
  flattenToListByKey(listOfMap, key) {
    return listOfMap.reduce((acc, val) => acc.concat(val[key]), []);
  },

  /**
   * Converts a list of objects (e.g. from DB query) to a Map by specified unique key (e.g. usually id)
   * @param listOfMap
   * @param key (optional) the key to map by. Default is 'id'.
   * @return {Map}
   */
  toMapByKey(listOfMap, key = 'id') {
    return listOfMap.reduce((acc, val) => acc.set(val[key], val), new Map());
  },

  /**
   * Wait for the specified timeout
   * @param timeout in milliseconds
   * @return {Promise}
   */
  delay(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  },

  /**
   * Wait until condition is true
   * @param conditionFunc the function that executes some condition and returns true or false
   * @param checkInterval the ms to wait until rechecking the condition
   * @param abortInterval the total interval to wait until aborting the wait
   * @param callerId (optional) usually a text to be used for a more suggestive logging on abort. If not provided,
   * conditionFunc.displayName will be used.
   * @return {Promise.<T>}
   */
  waitWhile(conditionFunc, checkInterval, abortInterval = undefined, callerId = undefined) {
    if (conditionFunc() === true) {
      if (abortInterval !== undefined) {
        if (abortInterval < 0) {
          return Promise.reject(`Condition wait aborted for ${callerId || conditionFunc.name}`);
        }
        abortInterval -= checkInterval;
      }
      return Utils.delay(checkInterval).then(() => this.waitWhile(conditionFunc, checkInterval, abortInterval));
    }
    return Promise.resolve();
  },

  /**
   * Removes _id from a collection mostly to be used in unit testing
   * @param collectionToFix a list of objects to remove the _id property
   * @return collection of modified objectes without _id
   */
  removeIdFromCollection(collectionToFix) {
    return collectionToFix.map((item) => {
      delete item._id;
      return item;
    });
  },

  /**
   * Removes DB storage internal _id, mostly for
   * @param item
   * @return {*}
   */
  removeIdFromItem(item) {
    delete item._id;
    return item;
  },

  capitalize(text: string) {
    return text.replace(/(?:^|\s)\S/g, char => char.toUpperCase());
  },

  stripTags(tagString) {
    if (tagString) {
      const htmlTags = /<[^>]*>/g;
      const noTags = tagString.replace(htmlTags, '');
      return noTags;
    }
    return '';
  },

  joinMessages(messages: Array, endPunctuationIfMissing = '.') {
    return messages && messages.map(m => {
      const msg = `${m.message || m}`;
      if (!msg.match(ENDS_WITH_PUNCTUATION_REGEX)) {
        return `${msg}${endPunctuationIfMissing}`;
      }
      return msg;
    }).join(' ');
  },

  /**
   * Show in the highest unit or exact unit if such is given
   * @param bytes
   * @param exactUnit
   * @return {{value: string, label: string}}
   */
  simplifyDataSize(bytes, exactUnit) {
    const convertTo = ['Bytes', 'KB', 'MB', 'GB'];
    let value = bytes;
    const label = convertTo.find(unit => {
      if ((value / 1024 < 1 && !exactUnit) || (exactUnit === unit)) {
        return true;
      }
      value /= 1024.0;
      return false;
    });
    return { value, label };
  },

  /**
   * Get runtime platform details. Sample:
   * {
   *  platform: 'debian',
   *  arch: 64
   * }
   * @return {*}
   */
  getPlatformDetails() {
    const userAgent = navigator.userAgent;
    const userAgentLowerCase = userAgent.toLowerCase();
    let platform = os.platform().toLowerCase();
    if (platform === 'darwin') {
      platform = PLATFORM_MAC_OS;
    } else if (platform === 'win32') {
      platform = PLATFORM_WINDOWS;
    } else if (platform === 'linux') {
      if (userAgentLowerCase.includes('red hat')) {
        platform = PLATFORM_REDHAT;
      } else {
        platform = PLATFORM_DEBIAN;
      }
    }
    let arch = os.arch();
    if (ARCH64_NODE_OS_OPTIONS.has(arch) || ARCH64_USER_AGENT_OPTIONS.some(a64 => userAgentLowerCase.includes(a64))) {
      arch = ARCH64;
    } else {
      arch = ARCH32;
    }
    return { platform, arch };
  },

  /* eslint-disable no-undef */
  getBranch() {
    // __BRANCH_NAME__ is detected when compiling locally.
    // JENKINS_BRANCH is detected when compiling through Jenkins.
    // Remove extra spaces/returns on these strings.
    return (process.env.JENKINS_BRANCH || __BRANCH_NAME__ || '').trim();
  },

  getPR() {
    return __PR_NR__;
  },

  getBuildDate() {
    return __BUILD_DATE__;
  },

  getCommitHash() {
    return __COMMIT_HASH__;
  },
  /* eslint-disable no-undef */

  isReleaseBranch() {
    const branch = this.getBranch();
    return RELEASE_BRANCHES.some(relBranch => branch.match(relBranch));
  },

  compareWithCollate(text1, text2, collator) {
    collator = collator || { sensitivity: 'base', ignorePunctuation: true };
    return new Intl.Collator('us', collator).compare(text1, text2);
  },

  arrayFlatMap(array: Array) {
    return array.reduce((result, elem) => result.concat(elem), []);
  },

  versionToKey() {
    return VERSION.replace(/\./g, '_');
  },

  versionFromKey(key) {
    return key.replace(/_/g, '.');
  },

  getCurrentVersion() {
    return VERSION;
  }
};

module.exports = Utils;
