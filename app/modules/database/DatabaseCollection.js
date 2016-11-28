const DatabaseCollection = {
  name: '',
  nedbDatastore: undefined,

  constructor(name, datastore) {
    this.name = name;
    this.nedbDatastore = datastore;
  }
};

export default DatabaseCollection;
