import * as generic from '../templates/generic-changeset';

export default({
  changelog: {
    changesets: [{
      ...generic.changeset('AMPOFFLINE-1307'),
      // currently there is no case insensitive support for ENUM in JSON schema
      context: 'Startup'
    }]
  }
});
