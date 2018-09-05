import { SYNCUP_TYPE_RESOURCE_FIELDS } from '../../../utils/Constants';
import {
  RESOURCE_FIELDS_PER_WORKSPACE_MEMBER_URL,
  RESOURCE_SINGLE_FIELDS_TREE_URL
} from '../../connectivity/AmpApiConstants';
import FieldsSyncUpManager from './FieldsSyncUpManager';

/**
 * Resource specific Fields Sync Up Manager
 *
 * @author Nadejda Mandrescu
 */
export default class ResourceFieldsSyncUpManager extends FieldsSyncUpManager {
  constructor() {
    super(SYNCUP_TYPE_RESOURCE_FIELDS, RESOURCE_SINGLE_FIELDS_TREE_URL, RESOURCE_FIELDS_PER_WORKSPACE_MEMBER_URL);
  }
}
