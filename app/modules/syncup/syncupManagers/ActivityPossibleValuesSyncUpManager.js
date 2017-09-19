import PossibleValuesSyncUpManager from './PossibleValuesSyncUpManager';
import { ACTIVITY_POSSIBLE_VALUES_PER_FIELD_PATHS } from '../../connectivity/AmpApiConstants';
import { SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES } from '../../../utils/Constants';

export default class ActivityPossibleValuesSyncUpManager extends PossibleValuesSyncUpManager {
  constructor() {
    super(SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES, ACTIVITY_POSSIBLE_VALUES_PER_FIELD_PATHS);
  }
}
