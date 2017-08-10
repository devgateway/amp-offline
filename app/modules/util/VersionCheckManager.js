import ConnectionHelper from '../connectivity/ConnectionHelper';
import LoggerManager from './LoggerManager';
import { URL_CONNECTIVITY_CHECK_EP } from '../../modules/connectivity/AmpApiConstants';
import store from '../../index';

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
    ConnectionHelper.doGet({ url: URL_CONNECTIVITY_CHECK_EP }).then((data) => {
      const noVersionData = null;
      if (data && data[LATEST_AMP_OFFLINE]) {
        const url = buildUrl(data[LATEST_AMP_OFFLINE].url);
        if (data[AMP_OFFLINE_COMPATIBLE] === false || data[LATEST_AMP_OFFLINE].critical === true) {
          // This is a mandatory update.
          const versionData = Object.assign({}, data, { [MANDATORY_UPDATE]: true });
          versionData[LATEST_AMP_OFFLINE].url = url;
          return resolve(versionData);
        } else if (data[LATEST_AMP_OFFLINE].version !== version) {
          // This is an optional update.
          const versionData = Object.assign({}, data, { [MANDATORY_UPDATE]: false });
          versionData[LATEST_AMP_OFFLINE].url = url;
          return resolve(versionData);
        }
        return resolve(noVersionData);
      }
      return resolve(noVersionData);
    })
  ));
}

function buildUrl(url) {
  LoggerManager.log('buildUrl');
  const baseUrl = store.getState().startUpReducer.connectionInformation.getFullUrl();
  return url.replace(/<base_url>/gi, baseUrl);
}
