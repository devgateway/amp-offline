import * as Utils from '../../../../app/utils/Utils';
import * as MC from '../../../../app/utils/constants/MigrationsConstants';

export const changeset = (changeid) => ({
  changeid: `${changeid}-${Utils.stringToUniqueId()}`,
  author: 'nmandrescu',
  comment: 'Generic changeset',
  context: 'startup',
  changes: {
    func: () => {
    }
  }
});

export const changesets = (changeid) => ([changeset(changeid)]);

export const preconditionPassFunc = {
  func: () => true
};

export const preconditionFailAndContinueFunc = {
  func: () => false,
  onFail: MC.ON_FAIL_ERROR_CONTINUE
};
