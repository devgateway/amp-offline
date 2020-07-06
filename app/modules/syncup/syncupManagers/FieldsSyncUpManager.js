import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import * as FieldsHelper from '../../helpers/FieldsHelper';
import * as TeamMemberHelper from '../../helpers/TeamMemberHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import * as Utils from '../../../utils/Utils';

/* eslint-disable class-methods-use-this */

// TODO update once AMP-25568 is also done, as part of AMPOFFLINE-270
/**
 * Fields definition syncup Manager
 * @author Nadejda Mandrescu
 */
export default class FieldsSyncUpManager extends AbstractAtomicSyncUpManager {
  constructor(fieldsType, singleFieldsTreeUrl, perWSFieldsUrl) {
    super(fieldsType);
    this._fieldsType = fieldsType;
    this._singleFieldsTreeUrl = singleFieldsTreeUrl;
    this._perWSFieldsUrl = perWSFieldsUrl;
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
    return TeamMemberHelper.findAll({}).then(wsMemberIdsMap => {
      const paramsMap = { 'ws-member-ids': Utils.flattenToListByKey(wsMemberIdsMap, 'id') };
      return ConnectionHelper.doGet({ url: this._perWSFieldsUrl, paramsMap, shouldRetry: true })
        .then(FieldsHelper.replaceAll);
    });
  }
}
