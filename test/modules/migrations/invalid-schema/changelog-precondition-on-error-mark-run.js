import * as generic from '../templates/generic-changeset';

export default({
  changelog: {
    preConditions: [generic.preconditionErrorAndMarkRunFunc],
    changesets: generic.changesets('AMPOFFLINE-1307')
  }
});
