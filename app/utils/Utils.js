const Utils = {

  stringToId(email) {
    let hash = 5381;
    let i = email.length;
    while (i) {
      hash = (hash * 33) ^ email.charCodeAt(--i);
    }
    return hash >>> 0;
  }

};

module.exports = Utils;
