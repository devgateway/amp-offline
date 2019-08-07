/* eslint-disable class-methods-use-this */
/* eslint-disable no-lonely-if */
import { ActivityConstants } from 'amp-ui';
import * as WC from '../../utils/constants/WorkspaceConstants';
import * as GSC from '../../utils/constants/GlobalSettingsConstants';
import Logger from '../../modules/util/LoggerManager';
import GlobalSettingsManager from '../../modules/util/GlobalSettingsManager';
import WSSettingsHelpers from '../../modules/helpers/WSSettingsHelper';
import WorkspaceHelper from '../../modules/helpers/WorkspaceHelper';
import DateUtils from '../../utils/DateUtils';
import ApprovalStatus from '../../utils/constants/ApprovalStatus';

const logger = new Logger('Activity status validation');

/**
 * Replicate activity validation logic from AMP's ActivityUtil.setActivityStatus()
 * @author ginchauspe.
 */
export default class ActivityStatusValidation {

  /**
   * As close as possible to AMP's code.
   * @param dehydratedActivity
   * @param teamMember
   * @param rejected: might not be used in Offline, keeping just in case we implement the use case.
   * @returns {Promise.<TResult>}
   */
  static statusValidation(dehydratedActivity, teamMember, rejected) {
    logger.debug('statusValidation');
    const isNew = (dehydratedActivity.id === undefined &&
      dehydratedActivity[ActivityConstants.INTERNAL_ID] === undefined);
    const projectValidationEnabled = GlobalSettingsManager.getSettingByKey(GSC.PROJECTS_VALIDATION);
    const isSameWorkspace = teamMember[WC.WORKSPACE_ID] === dehydratedActivity[ActivityConstants.TEAM];
    return WorkspaceHelper.findById(teamMember[WC.WORKSPACE_ID]).then(workspace =>
      WSSettingsHelpers.findByWorkspaceId(teamMember[WC.WORKSPACE_ID]).then(workspaceSettings => {
        const wsValidationType = workspaceSettings[WC.WS_VALIDATION_FIELD];
        const isCrossTeamValidation = workspace[WC.CROSS_TEAM_VALIDATION];
        if (projectValidationEnabled === GSC.GS_ON && wsValidationType !== WC.WS_VALIDATION_OFF) {
          const teamLeadFlag = teamMember[WC.ROLE_ID] === WC.ROLE_TEAM_MEMBER_WS_MANAGER
            || teamMember[WC.ROLE_ID] === WC.ROLE_TEAM_MEMBER_WS_APPROVER;
          if (teamLeadFlag) {
            if (dehydratedActivity[ActivityConstants.IS_DRAFT]) {
              if (rejected) {
                dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.REJECTED.id;
              } else {
                if (isNew) {
                  dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.STARTED.id;
                } else {
                  if (dehydratedActivity[ActivityConstants.APPROVAL_STATUS] === ApprovalStatus.STARTED.id) {
                    dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.STARTED.id;
                  } else {
                    dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.EDITED.id;
                  }
                }
              }
            } else {
              // If activity belongs to the same workspace where TL/AP is logged set it validated.
              if (isSameWorkspace) {
                dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.APPROVED.id;
                dehydratedActivity[ActivityConstants.APPROVED_BY] = teamMember.id;
                dehydratedActivity[ActivityConstants.APPROVAL_DATE] = DateUtils.getTimestampForAPI();
              } else {
                if (isCrossTeamValidation) {
                  dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.APPROVED.id;
                  dehydratedActivity[ActivityConstants.APPROVED_BY] = teamMember.id;
                  dehydratedActivity[ActivityConstants.APPROVAL_DATE] = DateUtils.getTimestampForAPI();
                } else {
                  dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.STARTED.id;
                }
              }
            }
          } else {
            if (wsValidationType === WC.WS_VALIDATION_NEW_ONLY) {
              if (isNew) {
                dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.STARTED.id;
              } else {
                if (dehydratedActivity[ActivityConstants.APPROVAL_STATUS] === ApprovalStatus.STARTED.id) {
                  dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.STARTED.id;
                } else {
                  dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.APPROVED.id;
                }
              }
            } else {
              if (wsValidationType === WC.WS_VALIDATION_ALL_EDIT) {
                if (isNew) {
                  dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.STARTED.id;
                } else {
                  if (dehydratedActivity[ActivityConstants.APPROVAL_STATUS] === ApprovalStatus.STARTED.id) {
                    dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.STARTED.id;
                  } else {
                    dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.EDITED.id;
                  }
                }
              }
            }
          }
        } else {
          // Validation is OFF in GS activity approved.
          if (isNew) {
            dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.STARTED_APPROVED.id;
          } else {
            dehydratedActivity[ActivityConstants.APPROVAL_STATUS] = ApprovalStatus.APPROVED.id;
          }
          dehydratedActivity[ActivityConstants.APPROVED_BY] = teamMember.id;
          dehydratedActivity[ActivityConstants.APPROVAL_DATE] = DateUtils.getTimestampForAPI();
        }
        return dehydratedActivity[ActivityConstants.APPROVAL_STATUS];
      })
    );
  }
}
