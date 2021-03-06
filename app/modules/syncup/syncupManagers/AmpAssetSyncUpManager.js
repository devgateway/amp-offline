/* eslint-disable class-methods-use-this */
import { Constants } from 'amp-ui';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { AMP_COUNTRY_FLAG } from '../../connectivity/AmpApiConstants';
import FileManager from '../../util/FileManager';

/**
 * Class to hold sync mechanism for amp assets
 */
export default class AmpAssetSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(Constants.SYNCUP_TYPE_ASSETS);
  }

  doAtomicSyncUp() {
    // For now we are only saving AMP countryFlag as an image
    return ConnectionHelper.doGet({ url: AMP_COUNTRY_FLAG, shouldRetry: true }).then((image) => {
      FileManager.createDataDir(Constants.ASSETS_DIRECTORY);
      FileManager.writeDataFileSync(image, Constants.ASSETS_DIRECTORY, Constants.AMP_COUNTRY_LOGO);
      return null;
    });
  }
}
