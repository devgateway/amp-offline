import ConnectionHelper from '../connectivity/ConnectionHelper';
import {
  WORKSPACE_MEMBER_URL
} from '../connectivity/AmpApiConstants';
import TeamMemberHelper from '../helpers/TeamMemberHelper';

const WorkspaceMemberSyncUpManager = {

  syncWorkspaceMembers({ saved, removed }) {
    console.log('syncWorkspaceMembers');
    return ConnectionHelper.doGet({ url: WORKSPACE_MEMBER_URL, paramsMap: { ids: saved } })
      .then((data) => TeamMemberHelper.saveOrUpdateTeamMembers(data)
        .then(() => (TeamMemberHelper.deleteByIds(removed))));
  }
};

module.exports = WorkspaceMemberSyncUpManager;
