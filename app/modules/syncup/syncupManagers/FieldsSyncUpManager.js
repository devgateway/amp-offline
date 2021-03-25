import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import * as FieldsHelper from '../../helpers/FieldsHelper';
import * as TeamMemberHelper from '../../helpers/TeamMemberHelper';
import * as WorkspaceHelper from '../../helpers/WorkspaceHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import * as Utils from '../../../utils/Utils';

/* eslint-disable class-methods-use-this */

// TODO update once AMP-25568 is also done, as part of AMPOFFLINE-270
/**
 * Fields definition syncup Manager
 * @author Nadejda Mandrescu
 */
export default class FieldsSyncUpManager extends AbstractAtomicSyncUpManager {
  constructor(fieldsType, singleFieldsTreeUrl, perWSFieldsUrl, useSingleTreeEP) {
    super(fieldsType);
    this._fieldsType = fieldsType;
    this._singleFieldsTreeUrl = singleFieldsTreeUrl;
    this._perWSFieldsUrl = perWSFieldsUrl;
    // TODO remove once AMP-25568 is done, as part of AMPOFFLINE-270
    this._useSingleTreeEP = useSingleTreeEP;
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
      return FieldsHelper.getSingleFieldsDef(this._fieldsType).then(this._linkAllWSMembersToSingleFieldsTree);
    }
    return Promise.resolve();
  }

  cancel() {
    // TODO implement once AMP-25568 is done, as part of AMPOFFLINE-270
  }

  _syncUpSingleFieldsTree() {
    return ConnectionHelper.doGet({ url: this._singleFieldsTreeUrl, shouldRetry: true })
        .then((fieldsDefTree) => this._linkAllWSMembersToSingleFieldsTree(fieldsDefTree));
  }

  _linkAllWSMembersToSingleFieldsTree(fieldsDefTree) {
    return this._getExistingWsMemberIds().then(wsMemberIds => {
      const newFieldsDef = Utils.toMap('ws-member-ids', wsMemberIds);
      newFieldsDef[this._fieldsType] = fieldsDefTree;
      return FieldsHelper.replaceAllByFieldsType([newFieldsDef], this._fieldsType);
    });
  }

  _getExistingWsMemberIds() {
    return TeamMemberHelper.findAll({}).then(wsMemberIdsMap => Utils.flattenToListByKey(wsMemberIdsMap, 'id'));
  }

  _syncUpFieldsTreePerWorkspaceMembers() {
    return WorkspaceHelper.findAll({}).then(wsMemberIdsMap => {
      const params = Utils.flattenToListByKey(wsMemberIdsMap, 'id');
      return ConnectionHelper.doPost({ url: this._perWSFieldsUrl, body: params, shouldRetry: true })
        .then(data => {
          // eslint-disable-next-line no-return-assign
          data.forEach(i => i['activity-fields'] = i.fields);
          return FieldsHelper.replaceAllByFieldsType(data, 'activity-fields');
        });
    });
  }
}
