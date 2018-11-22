import * as generic from '../templates/generic-changeset';

export default({
  changelog: {
    preConditions: [generic.preconditionFailAndContinueFunc],
    changesets: generic.changesets('AMPOFFLINE-1307')
  }
});
