import * as generic from '../templates/generic-changeset';

export default({
  changelog: {
    changesets: [{
      ...generic.changeset('AMPOFFLINE-1307'),
      context: () => 'test'
    }]
  }
});
