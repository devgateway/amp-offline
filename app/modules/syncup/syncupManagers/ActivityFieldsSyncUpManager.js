import { Constants } from 'amp-ui';
import {
  ACTIVITY_FIELDS_PER_WORKSPACE_MEMBER_URL,
} from '../../connectivity/AmpApiConstants';
import FieldsSyncUpManager from './FieldsSyncUpManager';

/**
 * Activities specific Fields Sync Up Manager
 * @author Nadejda Mandrescu
 */
export default class ActivityFieldsSyncUpManager extends FieldsSyncUpManager {
  constructor() {
    super(Constants.SYNCUP_TYPE_ACTIVITY_FIELDS, null,
      ACTIVITY_FIELDS_PER_WORKSPACE_MEMBER_URL, false);
  }
}
