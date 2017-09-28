import ConnectionHelper from '../../connectivity/ConnectionHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { AMP_COUNTRY_FLAG } from '../../connectivity/AmpApiConstants';
import { AMP_COUNTRY_LOGO, ASSEST_DIRECTORY, SYNCUP_TYPE_ASSETS } from '../../../utils/Constants';
import FileManager from '../../util/FileManager';

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
    return ConnectionHelper.doGet({ url: AMP_COUNTRY_FLAG, shouldRetry: true }).then((image) => {
      FileManager.createDataDir(ASSEST_DIRECTORY);
      FileManager.writeDataFileSync(image, ASSEST_DIRECTORY, AMP_COUNTRY_LOGO);
      return null;
    });
  }
}
