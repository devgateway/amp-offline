const Utils = {

  stringToId(string: string) {
    let hash = 5381;
    for (let i = string.length - 1; i >= 0; i--) {
      /* eslint-disable */
      hash = (hash * 33) ^ string.charCodeAt(i);
    }
    return hash >>> 0;
    /* eslint-enable */
  },

  toMap(key, value) {
    const result = {};
    result[key] = value;
    return result;
  }

};

module.exports = Utils;
