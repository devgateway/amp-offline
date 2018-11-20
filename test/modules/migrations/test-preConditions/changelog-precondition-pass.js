import * as generic from '../templates/generic-changeset';
import FileManager from '../../../../app/modules/util/FileManager';
import { checkAllExecuted } from '../MigrationsTestUtils';

const changelog = {
  preConditions: [
    {
      func: () => true
    },
  ],
  changesets: generic.changesets()
};
export default ({ changelog });

export const isValid = checkAllExecuted(FileManager.basename(__filename));
