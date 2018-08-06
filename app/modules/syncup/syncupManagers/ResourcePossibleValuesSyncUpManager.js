import PossibleValuesSyncUpManager from './PossibleValuesSyncUpManager';
import { SYNCUP_TYPE_RESOURCE_POSSIBLE_VALUES } from '../../../utils/Constants';
import { RESOURCE_POSSIBLE_VALUES_PER_FIELD_PATHS } from '../../connectivity/AmpApiConstants';

/**
 * Resource possible values sync up manager
 *
 * @author Nadejda Mandrescu
 */
export default class ResourcePossibleValuesSyncUpManager extends PossibleValuesSyncUpManager {
  constructor() {
    super(SYNCUP_TYPE_RESOURCE_POSSIBLE_VALUES, RESOURCE_POSSIBLE_VALUES_PER_FIELD_PATHS);
  }
}
