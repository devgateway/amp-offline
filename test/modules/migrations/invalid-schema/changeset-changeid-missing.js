import * as generic from '../templates/generic-changeset';

const c = generic.changeset('AMPOFFLINE-1307');
delete c.author;

export default({
  changelog: {
    changesets: [c]
  }
});
