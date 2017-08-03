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
    return `${this.stringToId(string)}-${Date.now()}-${Math.random()}`;
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
          return Promise.reject(`Condition wait aborted for ${callerId || conditionFunc.displayName}`);
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
  }
};

module.exports = Utils;
