import * as generic from '../templates/generic-changeset';
import FileManager from '../../../../app/modules/util/FileManager';
import { checkAllExecuted } from '../MigrationsTestUtils';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      // only func
      preConditions: [generic.preconditionPassFunc]
    },
    {
      ...generic.changeset('AMPOFFLINE-1307'),
      // func and dependent above changeset (dependency configured below)
      preConditions: [generic.preconditionPassFunc]
    },
  ]
};

const c1 = changelog.changesets[0];
changelog.changesets[1].preConditions.push({
  changeid: c1.changeid,
  author: c1.author,
  file: fileName
});

export default ({ changelog });

export const isValid = checkAllExecuted(fileName);
