import * as generic from '../templates/generic-changeset';
import FileManager from '../../../../app/modules/util/FileManager';
import { checkAllExecuted } from '../MigrationsTestUtils';

const fileName = FileManager.basename(__filename);

const changelog = {
  changesets: [
    {
      ...generic.changeset('AMPOFFLINE-1307')
    }
  ]
};

export default ({ changelog });

export const isValid = checkAllExecuted(fileName);
