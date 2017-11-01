/**
 * Created by JulianEduardo on 20/4/2017.
 */
import {
  AMP_COUNTRY_LOGO,
  ASSETS_DIRECTORY,
  BASE_64_PNG_PREFIX,
  IMAGES_DIR,
  STATIC_DIR,
  TRANSPARENT_FLAG
} from './Constants';
import FileManager from '../modules/util/FileManager';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('AssetsUtils.js');

const AssetsUtils = {
  loadImage(img) {
    // read binary data
    if (FileManager.existsSync(ASSETS_DIRECTORY, img)) {
      const bitmap = FileManager.readBinaryDataFileSync(ASSETS_DIRECTORY, img);
      return BASE_64_PNG_PREFIX + new Buffer(bitmap).toString('base64');
    } else {
      return BASE_64_PNG_PREFIX + TRANSPARENT_FLAG;
    }
  },

  setDefaultFlag() {
    logger.debug('setDefaultFlag');
    if (!FileManager.existsSync(ASSETS_DIRECTORY, AMP_COUNTRY_LOGO)) {
      const defaultFlagPath = FileManager.getFullPathForBuiltInResources(STATIC_DIR, IMAGES_DIR, AMP_COUNTRY_LOGO);
      logger.debug(`defaultFlagPath=${defaultFlagPath}`);
      FileManager.createDataDir(ASSETS_DIRECTORY);
      FileManager.copyDataFileSync(defaultFlagPath, ASSETS_DIRECTORY, AMP_COUNTRY_LOGO);
    }
  }
};

export default AssetsUtils;
