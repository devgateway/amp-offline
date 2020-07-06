import { Constants } from 'amp-ui';
import {
  ACTIVITY_FIELDS_PER_WORKSPACE_MEMBER_URL,
  ACTIVITY_SINGLE_FIELDS_TREE_URL
} from '../../connectivity/AmpApiConstants';
import FieldsSyncUpManager from './FieldsSyncUpManager';

/**
 * Activities specific Fields Sync Up Manager
 * @author Nadejda Mandrescu
 */
export default class ActivityFieldsSyncUpManager extends FieldsSyncUpManager {
  constructor() {
    super(Constants.SYNCUP_TYPE_ACTIVITY_FIELDS, ACTIVITY_SINGLE_FIELDS_TREE_URL,
      ACTIVITY_FIELDS_PER_WORKSPACE_MEMBER_URL);
  }
}
