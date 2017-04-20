import fs from 'fs';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import { AMP_COUNTRY_FLAG } from '../connectivity/AmpApiConstants';

/**
 * Class to hold sync mechanism for amp assets
 */
export default class AmpAssetManager {

  static syncUpAmpAssets() {
    // For now we are only saving AMP countryFlag as an image
    return new Promise((resolve, reject) => {
      ConnectionHelper.doGet({ url: AMP_COUNTRY_FLAG, shouldRetry: true }).then((image) => {
        fs.writeFileSync('./assets/ampCountryFlag.png', image);
        return resolve();
      }).catch(reject);
    });
  }
}
