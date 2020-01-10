import { Constants } from 'amp-ui';
/**
 * Created by JulianEduardo on 20/4/2017.
 */

import FileManager from '../modules/util/FileManager';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('AssetsUtils.js');

const AssetsUtils = {
  loadImage(img) {
    // read binary data
    if (FileManager.existsSync(Constants.ASSETS_DIRECTORY, img)) {
      const bitmap = FileManager.readBinaryDataFileSync(Constants.ASSETS_DIRECTORY, img);
      return Constants.BASE_64_PNG_PREFIX + new Buffer(bitmap).toString('base64');
    } else {
      return Constants.BASE_64_PNG_PREFIX + Constants.TRANSPARENT_FLAG;
    }
  },

  setDefaultFlag() {
    logger.debug('setDefaultFlag');
    if (!FileManager.existsSync(Constants.ASSETS_DIRECTORY, Constants.AMP_COUNTRY_LOGO)) {
      const defaultFlagPath = FileManager.getFullPathForBuiltInResources(Constants.STATIC_DIR, Constants.IMAGES_DIR,
        Constants.AMP_COUNTRY_LOGO);
      logger.debug(`defaultFlagPath=${defaultFlagPath}`);
      FileManager.createDataDir(Constants.ASSETS_DIRECTORY);
      FileManager.copyDataFileSync(defaultFlagPath, Constants.ASSETS_DIRECTORY, Constants.AMP_COUNTRY_LOGO);
    }
  }
};

export default AssetsUtils;
