import PossibleValuesSyncUpManager from './PossibleValuesSyncUpManager';
import { SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES } from '../../../utils/Constants';
import { CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS } from '../../connectivity/AmpApiConstants';

/**
 * Contact possible values sync up manager
 *
 * @author Nadejda Mandrescu
 */
export default class ContactPossibleValuesSyncUpManager extends PossibleValuesSyncUpManager {
  constructor() {
    super(SYNCUP_TYPE_CONTACT_POSSIBLE_VALUES, CONTACT_POSSIBLE_VALUES_PER_FIELD_PATHS);
  }
}
