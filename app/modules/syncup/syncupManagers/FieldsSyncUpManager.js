import { FIELDS_PER_WORKSPACE_MEMBER_URL, SINGLE_FIELDS_TREE_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import * as FieldsHelper from '../../helpers/FieldsHelper';
import * as TeamMemberHelper from '../../helpers/TeamMemberHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import Notification from '../../helpers/NotificationHelper';
import { SYNCUP_TYPE_FIELDS } from '../../../utils/Constants';
import * as Utils from '../../../utils/Utils';
import { NOTIFICATION_ORIGIN_DATABASE } from '../../../utils/constants/ErrorConstants';

/* eslint-disable class-methods-use-this */

// TODO update once AMP-25568 is also done, as part of AMPOFFLINE-270
/**
 * Fields definition syncup Manager
 * @author Nadejda Mandrescu
 */
export default class FieldsSyncUpManager extends AbstractAtomicSyncUpManager {
  constructor() {
    super(SYNCUP_TYPE_FIELDS);
    // TODO remove once AMP-25568 is done, as part of AMPOFFLINE-270
    this._useSingleTreeEP = true;
    this._doUpdate = true;
  }

  /**
   * Syncs fields definition tree
   * @return {Promise}
   */
  doAtomicSyncUp() {
    if (this._doUpdate) {
      if (this._useSingleTreeEP) {
        return this._syncUpSingleFieldsTree();
      }
      return this._syncUpFieldsTreePerWorkspaceMembers();
    } else if (this._useSingleTreeEP) {
      // if still using single fields tree, update the one from DB with the latest list of ws-member-ids
      return this._getSingleFieldsDef().then(this._linkAllWSMembersToSingleFieldsTree);
    }
    return Promise.resolve();
  }

  cancel() {
    // TODO implement once AMP-25568 is done, as part of AMPOFFLINE-270
  }

  _syncUpSingleFieldsTree() {
    return new Promise((resolve, reject) =>
      ConnectionHelper.doGet({ url: SINGLE_FIELDS_TREE_URL, shouldRetry: true })
        .then((fieldsDefTree) => this._linkAllWSMembersToSingleFieldsTree(fieldsDefTree))
        .then(resolve)
        .catch(reject));
  }

  _getSingleFieldsDef() {
    return FieldsHelper.findAll({}).then(fieldDefs => {
      if (fieldDefs.length === 1) {
        return Promise.resolve(fieldDefs[0].fields);
      }
      // TODO remove this error once AMP-25568 is also done, as part of AMPOFFLINE-270
      return Promise.reject(new Notification({
        message: 'noUniqueFieldsTree',
        origin: NOTIFICATION_ORIGIN_DATABASE
      }));
    });
  }

  _linkAllWSMembersToSingleFieldsTree(fieldsDefTree) {
    return this._getExistingWsMemberIds(2).then(wsMemberIds => {
      const newFieldsDef = {
        'ws-member-ids': wsMemberIds,
        fields: fieldsDefTree
      };
      return FieldsHelper.replaceAll([newFieldsDef]);
    });
  }

  _getExistingWsMemberIds(retries) {
    return TeamMemberHelper.findAll({}).then(wsMemberIdsMap => {
      // workaround for the first fields sync up that may execute before wsMembers, fix AMPOFFLINE-270 or AMPOFFLINE-209
      if (wsMemberIdsMap.length === 0 && retries > 0) {
        /* eslint-disable no-plusplus */
        return Utils.delay(5000).then(() => this._getExistingWsMemberIds(--retries));
        /* eslint-enable no-plusplus */
      }
      return Utils.flattenToListByKey(wsMemberIdsMap, 'id');
    });
  }

  _syncUpFieldsTreePerWorkspaceMembers() {
    return TeamMemberHelper.findAll({}).then(wsMemberIdsMap => {
      const paramsMap = { 'ws-member-ids': Utils.flattenToListByKey(wsMemberIdsMap, 'id') };
      return ConnectionHelper.doGet({ url: FIELDS_PER_WORKSPACE_MEMBER_URL, paramsMap, shouldRetry: true })
        .then(FieldsHelper.replaceAll);
    });
  }
}
