import { Constants } from 'amp-ui';
import {
  RESOURCE_FIELDS_PER_WORKSPACE_MEMBER_URL,
  RESOURCE_SINGLE_FIELDS_TREE_URL
} from '../../connectivity/AmpApiConstants';
import FieldsSyncUpManager from './FieldsSyncUpManager';
import * as WorkspaceHelper from '../../helpers/WorkspaceHelper';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import * as Utils from '../../../utils/Utils';
import * as FieldsHelper from '../../helpers/FieldsHelper';

/**
 * Resource specific Fields Sync Up Manager
 *
 * @author Nadejda Mandrescu
 */
export default class ResourceFieldsSyncUpManager extends FieldsSyncUpManager {
  constructor() {
    super(Constants.SYNCUP_TYPE_RESOURCE_FIELDS, RESOURCE_SINGLE_FIELDS_TREE_URL,
      RESOURCE_FIELDS_PER_WORKSPACE_MEMBER_URL, false);
  }

  _syncUpFieldsTreePerWorkspaceMembers() {
    return WorkspaceHelper.findAll({}).then(wsMemberIdsMap => {
      const params = Utils.flattenToListByKey(wsMemberIdsMap, 'id');
      return ConnectionHelper.doPost({ url: this._perWSFieldsUrl, body: params, shouldRetry: true })
        .then(data => {
          // eslint-disable-next-line no-return-assign
          data.forEach(i => i[Constants.SYNCUP_TYPE_RESOURCE_FIELDS] = i.fields);
          return FieldsHelper.replaceAllByFieldsType(data, Constants.SYNCUP_TYPE_RESOURCE_FIELDS);
        });
    });
  }
}
