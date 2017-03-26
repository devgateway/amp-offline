const Utils = {

  stringToId(string: string) {
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
    const result = {};
    result[key] = { $and: [{ $exists: true }, { $ne: null }] };
    return result;
  },

  /**
   * Expects a list of map elements that contain ids and extracts those ids into a flatten list
   * @param listOfMap a list of map elements, each having id field e.g. [ { id: 1, ...}, { id: 2,... }, ...]
   * @return flatten list of ids, e.g. [1, 2, ...]
   */
  flattenToListByKey(listOfMap, key) {
    return listOfMap.reduce((acc, val) => acc.concat(val[key]), []);
  },

  delay(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
  }
};

module.exports = Utils;
