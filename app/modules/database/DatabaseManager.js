const DatabaseManager = {

  connect(name, callback, options) {
    console.log('connect');
    callback(true);
  },

  disconnect(name, callback, options) {
    console.log('connect');
    callback(true);
  },

  createCollection(name, callback, options) {
    console.log('createCollection');
    callback(true);
  },

  destroyCollection(name, callback, options) {
    console.log('destroyCollection');
    callback(true);
  },

  insert(object, callback, options) {
    console.log('insert');
    callback(true);
  },

  remove(object, callback, options) {
    console.log('remove');
    callback(true);
  },

  find(object, callback, options) {
    console.log('find');
    callback(true);
  }

};

module.exports = DatabaseManager;
