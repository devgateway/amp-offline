import * as Utils from '../../../../app/utils/Utils';

export const changeset = () => ({
  changeid: `AMPOFFLINE-1307-${Utils.stringToUniqueId()}`,
  author: 'nmandrescu',
  comment: 'Generic changeset',
  context: 'startup',
  changes: {
    func: () => {
    }
  }
});

export const changesets = () => ([changeset()]);

export const preconditionPassFunc = {
  func: () => true
};
