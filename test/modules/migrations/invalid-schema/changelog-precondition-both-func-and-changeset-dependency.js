import * as generic from '../templates/generic-changeset';

export default({
  changelog: {
    preConditions: [
      {
        ...generic.preconditionPassFunc,
        changeid: 'AMPOFFLINE-1307-any',
        author: 'nmandrescu',
        file: 'any-file'
      }
    ],
    changesets: generic.changesets('AMPOFFLINE-1307')
  }
});
