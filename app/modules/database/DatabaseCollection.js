class DatabaseCollection {
  name: '';
  nedbDatastore: null;

  constructor(name, datastore) {
    this.name = name;
    this.nedbDatastore = datastore;
  }
}

export default DatabaseCollection;
