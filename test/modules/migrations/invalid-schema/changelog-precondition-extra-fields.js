import * as generic from '../templates/generic-changeset';

export default({
  changelog: {
    preConditions: {
      ...generic.preconditionPassFunc,
      invalidField: true
    },
    changesets: generic.changesets('AMPOFFLINE-1307')
  }
});
