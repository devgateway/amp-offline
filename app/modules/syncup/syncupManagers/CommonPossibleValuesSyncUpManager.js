import { Constants } from 'amp-ui';
import PossibleValuesSyncUpManager from './PossibleValuesSyncUpManager';
import { COMMON_POSSIBLE_VALUES_PER_FIELD_PATHS } from '../../connectivity/AmpApiConstants';

/**
 * Common possible values sync up manager
 *
 * @author Nadejda Mandrescu
 */
export default class CommonPossibleValuesSyncUpManager extends PossibleValuesSyncUpManager {
  constructor() {
    super(Constants.SYNCUP_TYPE_COMMON_POSSIBLE_VALUES, COMMON_POSSIBLE_VALUES_PER_FIELD_PATHS);
  }
}
