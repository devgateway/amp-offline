import * as Utils from '../../../../app/utils/Utils';

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
