import { SINGLE_FIELDS_TREE_URL, FIELDS_PER_WORKSPACE_MEMBER_URL } from '../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import * as FieldsHelper from '../helpers/FieldsHelper';
import * as TeamMemberHelper from '../helpers/TeamMemberHelper';
import Notification from '../helpers/NotificationHelper';
import * as Utils from '../../utils/Utils';
import { NOTIFICATION_ORIGIN_DATABASE } from '../../utils/constants/ErrorConstants';

// TODO remove this error once AMP-25568 is also done, as part of AMPOFFLINE-270
const FIELDS_ERROR = new Notification({
  message: 'noUniqueFieldsTree',
  origin: NOTIFICATION_ORIGIN_DATABASE
});

// TODO update once AMP-25568 is also done, as part of AMPOFFLINE-270
/**
 * Fields definition syncup Manager
 * @author Nadejda Mandrescu
 */
export default class FieldsSyncUpManager {
  constructor() {
    // TODO remove once AMP-25568 is done, as part of AMPOFFLINE-270
    this._useSingleTreeEP = true;
    this._doUpdate = true;
  }

  /**
   * Syncs fields definition tree
   * @return {Promise}
   */
  syncUp() {
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

  _syncUpSingleFieldsTree() {
    return ConnectionHelper.doGet({ url: SINGLE_FIELDS_TREE_URL, shouldRetry: true })
      .then(this._linkAllWSMembersToSingleFieldsTree);
  }

  static _getSingleFieldsDef() {
    return FieldsHelper.findAll({}).then(fieldDefs => {
      if (fieldDefs.length === 1) {
        return Promise.resolve(fieldDefs[0].fields);
      }
      return Promise.reject(FIELDS_ERROR);
    });
  }

  static _linkAllWSMembersToSingleFieldsTree(fieldsDefTree) {
    return TeamMemberHelper.findAll({}).then(wsMemberIdsMap => {
      const wsMemberIds = Utils.flattenToListByKey(wsMemberIdsMap, 'id');
      const newFieldsDef = {
        'ws-member-ids': wsMemberIds,
        fields: fieldsDefTree
      };
      return FieldsHelper.replaceAll([newFieldsDef]);
    });
  }

  static _syncUpFieldsTreePerWorkspaceMembers() {
    return TeamMemberHelper.findAll({}).then(wsMemberIdsMap => {
      const paramsMap = { 'ws-member-ids': Utils.flattenToListByKey(wsMemberIdsMap, 'id') };
      return ConnectionHelper.doGet({ url: FIELDS_PER_WORKSPACE_MEMBER_URL, paramsMap, shouldRetry: true })
        .then(FieldsHelper.replaceAll);
    });
  }
}
