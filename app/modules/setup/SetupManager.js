import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import { AMP_REGISTRY_SETTINGS_URL } from '../connectivity/AmpApiConstants';

const SetupManager = {
  getSetupOptions() {
    return ConnectionHelper.doGet({ url: AMP_REGISTRY_SETTINGS_URL, shouldRetry: true });
  }

};

export default SetupManager;
