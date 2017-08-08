import ConnectionHelper from '../connectivity/ConnectionHelper';
import LoggerManager from './LoggerManager';
import { CHECK_VERSION_URL } from '../../modules/connectivity/AmpApiConstants';

export const LATEST_AMP_OFFLINE = 'latest-amp-offline';
export const AMP_OFFLINE_COMPATIBLE = 'amp-offline-compatible';
export const MANDATORY_UPDATE = 'mandatory_update';

/**
 * Version Check Manager
 * @author Gabriel Inchauspe
 */

export function checkVersion(version) {
  LoggerManager.log('checkVersion');
  return new Promise((resolve) => (
    ConnectionHelper.doGet({ url: CHECK_VERSION_URL }).then((data) => {
      const noVersionData = null;
      if (data && data[LATEST_AMP_OFFLINE]) {
        if (data[AMP_OFFLINE_COMPATIBLE] === false || data[LATEST_AMP_OFFLINE].critical === true) {
          // This is a mandatory update.
          const versionData = Object.assign({}, data, { [MANDATORY_UPDATE]: true });
          return resolve(versionData);
        } else if (data[LATEST_AMP_OFFLINE].version !== version) {
          // This is an optional update.
          const versionData = Object.assign({}, data, { [MANDATORY_UPDATE]: false });
          return resolve(versionData);
        }
        return resolve(noVersionData);
      }
      return resolve(noVersionData);
    })
  ));
}
