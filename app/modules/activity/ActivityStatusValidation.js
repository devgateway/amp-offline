/* eslint-disable class-methods-use-this */
/* eslint-disable no-lonely-if */
import * as AC from '../../utils/constants/ActivityConstants';
import * as GSC from '../../utils/constants/GlobalSettingsConstants';
import LoggerManager from '../../modules/util/LoggerManager';
import GlobalSettingsManager from '../../modules/util/GlobalSettingsManager';
import WSSettingsHelpers from '../../modules/helpers/WSSettingsHelper';
import WorkspaceHelper from '../../modules/helpers/WorkspaceHelper';

/**
 * Replicate activity validation logic from AMP ActivityUtil.setActivityStatus()
 * @author ginchauspe.
 */
export default class ActivityStatusValidation {

  static statusValidation(dehydratedActivity, teamMember, rejected) {
    LoggerManager.debug('statusValidation');
    const isNew = false; // TODO: define how to differentiate new from edited activity.
    const projectValidationEnabled = GlobalSettingsManager.getSettingByKey(GSC.PROJECTS_VALIDATION);
    const isSameWorkspace = teamMember[AC.WORKSPACE_ID] === dehydratedActivity[AC.TEAM];
    return WorkspaceHelper.findById(teamMember[AC.WORKSPACE_ID]).then(workspace => (
      WSSettingsHelpers.findByWorkspaceId(teamMember[AC.WORKSPACE_ID]).then(workspaceSettings => {
        const wsValidationType = workspaceSettings[AC.WS_VALIDATION_FIELD];
        const isCrossTeamValidation = workspace[AC.CROSS_TEAM_VALIDATION];
        if (projectValidationEnabled === GSC.GS_ON && wsValidationType !== AC.WS_VALIDATION_OFF) {
          const teamLeadFlag = teamMember[AC.ROLE_ID] === AC.ROLE_TEAM_MEMBER_WS_MANAGER
            || teamMember[AC.ROLE_ID] === AC.ROLE_TEAM_MEMBER_WS_APPROVER;
          if (teamLeadFlag) {
            if (dehydratedActivity[AC.IS_DRAFT]) {
              if (rejected) {
                dehydratedActivity[AC.APPROVAL_STATUS] = AC.REJECTED_STATUS;
              } else {
                if (isNew) {
                  dehydratedActivity[AC.APPROVAL_STATUS] = AC.STARTED_STATUS;
                } else {
                  if (dehydratedActivity[AC.APPROVAL_STATUS] === AC.STARTED_STATUS) {
                    dehydratedActivity[AC.APPROVAL_STATUS] = AC.STARTED_STATUS;
                  } else {
                    dehydratedActivity[AC.APPROVAL_STATUS] = AC.EDITED_STATUS;
                  }
                }
              }
            } else {
              // If activity belongs to the same workspace where TL/AP is logged set it validated.
              if (isSameWorkspace) {
                dehydratedActivity[AC.APPROVAL_STATUS] = AC.APPROVED_STATUS;
                dehydratedActivity[AC.APPROVED_BY] = teamMember.id;
                dehydratedActivity[AC.APPROVAL_DATE] = new Date().toISOString();
              } else {
                if (isCrossTeamValidation) {
                  dehydratedActivity[AC.APPROVAL_STATUS] = AC.APPROVED_STATUS;
                  dehydratedActivity[AC.APPROVED_BY] = teamMember.id;
                  dehydratedActivity[AC.APPROVAL_DATE] = new Date().toISOString();
                } else {
                  dehydratedActivity[AC.APPROVAL_STATUS] = AC.STARTED_STATUS;
                }
              }
            }
          } else {
            if (wsValidationType === AC.WS_VALIDATION_NEW_ONLY) {
              if (isNew) {
                dehydratedActivity[AC.APPROVAL_STATUS] = AC.STARTED_STATUS;
              } else {
                if (dehydratedActivity[AC.APPROVAL_STATUS] === AC.STARTED_STATUS) {
                  dehydratedActivity[AC.APPROVAL_STATUS] = AC.STARTED_STATUS;
                } else {
                  dehydratedActivity[AC.APPROVAL_STATUS] = AC.APPROVED_STATUS;
                }
              }
            } else {
              if (wsValidationType === AC.WS_VALIDATION_ALL_EDIT) {
                if (isNew) {
                  dehydratedActivity[AC.APPROVAL_STATUS] = AC.STARTED_STATUS;
                } else {
                  if (dehydratedActivity[AC.APPROVAL_STATUS] === AC.STARTED_STATUS) {
                    dehydratedActivity[AC.APPROVAL_STATUS] = AC.STARTED_STATUS;
                  } else {
                    dehydratedActivity[AC.APPROVAL_STATUS] = AC.EDITED_STATUS;
                  }
                }
              }
            }
          }
        } else {
          // Validation is OF in GS activity approved.
          if (isNew) {
            dehydratedActivity[AC.APPROVAL_STATUS] = AC.STARTED_APPROVED_STATUS;
          } else {
            dehydratedActivity[AC.APPROVAL_STATUS] = AC.APPROVED_STATUS;
          }
          dehydratedActivity[AC.APPROVED_BY] = teamMember.id;
          dehydratedActivity[AC.APPROVAL_DATE] = new Date().toISOString();
        }
        return dehydratedActivity[AC.APPROVAL_STATUS];
      })
    ));
  }

}
