import { Constants } from 'amp-ui';
import {
  CONTACT_FIELDS_PER_WORKSPACE_MEMBER_URL,
  CONTACT_SINGLE_FIELDS_TREE_URL
} from '../../connectivity/AmpApiConstants';
import FieldsSyncUpManager from './FieldsSyncUpManager';

/**
 * Contacts specific Fields Sync Up Manager
 * @author Nadejda Mandrescu
 */
export default class ContactFieldsSyncUpManager extends FieldsSyncUpManager {
  constructor() {
    super(Constants.SYNCUP_TYPE_CONTACT_FIELDS, CONTACT_SINGLE_FIELDS_TREE_URL,
      CONTACT_FIELDS_PER_WORKSPACE_MEMBER_URL, true);
  }
}
