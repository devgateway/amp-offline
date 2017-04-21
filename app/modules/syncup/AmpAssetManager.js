import fs from 'fs';
import ConnectionHelper from '../connectivity/ConnectionHelper';
import { AMP_COUNTRY_FLAG } from '../connectivity/AmpApiConstants';
import { AMP_COUNTRY_LOGO, ASSEST_DIRECTORY } from '../../utils/Constants';

/**
 * Class to hold sync mechanism for amp assets
 */
export default class AmpAssetManager {

  static syncUpAmpAssets() {
    // For now we are only saving AMP countryFlag as an image
    return new Promise((resolve, reject) => {
      ConnectionHelper.doGet({ url: AMP_COUNTRY_FLAG, shouldRetry: true }).then((image) => {
        if (!fs.existsSync(ASSEST_DIRECTORY)) {
          // if the assets directory does not exist we create it
          fs.mkdirSync(ASSEST_DIRECTORY);
        }
        fs.writeFileSync(AMP_COUNTRY_LOGO, image);
        return resolve();
      }).catch(reject);
    });
  }
}
