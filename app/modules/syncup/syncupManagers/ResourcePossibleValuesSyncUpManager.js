import { Constants } from 'amp-ui';
import PossibleValuesSyncUpManager from './PossibleValuesSyncUpManager';
import { RESOURCE_POSSIBLE_VALUES_PER_FIELD_PATHS } from '../../connectivity/AmpApiConstants';

/**
 * Resource possible values sync up manager
 *
 * @author Nadejda Mandrescu
 */
export default class ResourcePossibleValuesSyncUpManager extends PossibleValuesSyncUpManager {
  constructor() {
    super(Constants.SYNCUP_TYPE_RESOURCE_POSSIBLE_VALUES, RESOURCE_POSSIBLE_VALUES_PER_FIELD_PATHS);
  }
}
