import ConnectionHelper from '../connectivity/ConnectionHelper';
import LoggerManager from './LoggerManager';
import { CHECK_VERSION_URL } from '../../modules/connectivity/AmpApiConstants';
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
    ConnectionHelper.doGet({ url: CHECK_VERSION_URL }).then((data) => {
      // TODO: delete this mock data.
      data = {
        'amp-offline-compatible': true,
        'amp-version': '3.0',
        'amp-offline-enabled': true,
        'latest-amp-offline': {
          os: 'windows',
          arch: '32',
          critical: false,
          date: '2017-01-01',
          version: '1.4.0',
          url: '<base_url>/amp-client/release?v=1.2.1&os=windows&arch=32'
        }
      };
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
