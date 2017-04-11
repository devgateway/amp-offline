import ConnectionHelper from '../connectivity/ConnectionHelper';
import {
  WORKSPACE_MEMBER_URL
} from '../connectivity/AmpApiConstants';
import TeamMemberHelper from '../helpers/TeamMemberHelper';
import LoggerManager from '../../modules/util/LoggerManager';

const WorkspaceMemberSyncUpManager = {

  syncWorkspaceMembers({ saved, removed }) {
    LoggerManager.log('syncWorkspaceMembers');
    return ConnectionHelper.doGet({ url: WORKSPACE_MEMBER_URL, paramsMap: { ids: saved } })
      .then((data) => TeamMemberHelper.saveOrUpdateTeamMembers(data)
        .then(() => (TeamMemberHelper.deleteByIds(removed))));
  }
};

module.exports = WorkspaceMemberSyncUpManager;
