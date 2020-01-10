import { Constants } from 'amp-ui';
import PossibleValuesSyncUpManager from './PossibleValuesSyncUpManager';
import { CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS } from '../../connectivity/AmpApiConstants';

/**
 * Contact possible values sync up manager
 *
 * @author Nadejda Mandrescu
 */
export default class ContactPossibleValuesSyncUpManager extends PossibleValuesSyncUpManager {
  constructor() {
    super(Constants.SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES, CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS);
  }
}
