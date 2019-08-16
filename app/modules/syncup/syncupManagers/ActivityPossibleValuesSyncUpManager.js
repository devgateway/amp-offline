import { Constants } from 'amp-ui';
import PossibleValuesSyncUpManager from './PossibleValuesSyncUpManager';
import { ACTIVITY_POSSIBLE_VALUES_PER_FIELD_PATHS } from '../../connectivity/AmpApiConstants';

export default class ActivityPossibleValuesSyncUpManager extends PossibleValuesSyncUpManager {
  constructor() {
    super(Constants.SYNCUP_TYPE_ACTIVITY_POSSIBLE_VALUES, ACTIVITY_POSSIBLE_VALUES_PER_FIELD_PATHS);
  }
}
