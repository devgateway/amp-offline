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

export const preconditionFailAndDefault = {
  func: () => false,
};

export const preconditionFailAndMarkRunFunc = {
  func: () => false,
  onFail: MC.ON_FAIL_ERROR_MARK_RAN
};

export const preconditionFailAndWarn = {
  func: () => false,
  onFail: MC.ON_FAIL_ERROR_WARN
};

export const preconditionErrorAndDefault = {
  func: () => { throw new Error('Precondition Error'); }
};

export const preconditionErrorAndContinueFunc = {
  func: () => { throw new Error('Precondition Error'); },
  onError: MC.ON_FAIL_ERROR_CONTINUE
};

export const preconditionErrorAndMarkRunFunc = {
  func: () => { throw new Error('Precondition Error'); },
  onError: MC.ON_FAIL_ERROR_MARK_RAN
};

export const preconditionErrorAndWarn = {
  func: () => { throw new Error('Precondition Error'); },
  onError: MC.ON_FAIL_ERROR_WARN
};
