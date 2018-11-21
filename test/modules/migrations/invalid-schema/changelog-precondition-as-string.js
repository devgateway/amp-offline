import * as generic from '../templates/generic-changeset';

export default({
  changelog: {
    preConditions: ['test'],
    changesets: generic.changesets('AMPOFFLINE-1307')
  }
});
