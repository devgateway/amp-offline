import ConnectionHelper from '../../connectivity/ConnectionHelper';
import { WORKSPACE_MEMBER_URL } from '../../connectivity/AmpApiConstants';
import TeamMemberHelper from '../../helpers/TeamMemberHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { SYNCUP_TYPE_WORKSPACE_MEMBERS } from '../../../utils/Constants';
import LoggerManager from '../../util/LoggerManager';

/* eslint-disable class-methods-use-this */

export default class WorkspaceMemberSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_WORKSPACE_MEMBERS);
  }

  doAtomicSyncUp({ saved, removed }) {
    this.diff = { saved, removed };
    return Promise.all([
      this._pullWorkspaceMembers(saved).then((data) => {
        this.diff.saved = [];
        return data;
      }),
      this._deleteWorkspaceMembers(removed).then((data) => {
        this.diff.removed = [];
        return data;
      })
    ]);
  }

  _pullWorkspaceMembers(saved) {
    LoggerManager.log('_pullWorkspaceMembers');
    return ConnectionHelper.doGet({ url: WORKSPACE_MEMBER_URL, paramsMap: { ids: saved } })
      .then((data) => TeamMemberHelper.saveOrUpdateTeamMembers(data));
  }

  _deleteWorkspaceMembers(removed) {
    LoggerManager.log('_deleteWorkspaceMembers');
    return TeamMemberHelper.deleteByIds(removed);
  }
}
