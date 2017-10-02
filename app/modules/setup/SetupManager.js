import * as ConnectionHelper from '../connectivity/ConnectionHelper';
import { AMP_REGISTRY_SETTINGS_URL } from '../connectivity/AmpApiConstants';

/**
 * Setup Manager
 *
 * @author Nadejda Mandrescu
 */
const SetupManager = {
  /**
   * Retrieves all AMP countries setup settings from AMP Registry
   */
  getSetupOptions() {
    return ConnectionHelper.doGet({ url: AMP_REGISTRY_SETTINGS_URL, shouldRetry: true });
  }

};

export default SetupManager;
