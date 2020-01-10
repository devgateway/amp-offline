import * as generic from '../templates/generic-changeset';

export default({
  changelog: {
    preConditions: [generic.preconditionErrorAndContinueFunc],
    changesets: generic.changesets('AMPOFFLINE-1307')
  }
});
