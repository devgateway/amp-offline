import fs from 'fs';
import ConnectionHelper from '../../connectivity/ConnectionHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { AMP_COUNTRY_FLAG } from '../../connectivity/AmpApiConstants';
import { AMP_COUNTRY_LOGO, ASSEST_DIRECTORY, SYNCUP_TYPE_ASSETS } from '../../../utils/Constants';

/* eslint-disable class-methods-use-this */

/**
 * Class to hold sync mechanism for amp assets
 */
export default class AmpAssetManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_ASSETS);
  }

  doAtomicSyncUp() {
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
