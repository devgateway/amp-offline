import { Constants } from 'amp-ui';
import FileManager from '../modules/util/FileManager';

/**
 * Access to static assets
 *
 * @author Nadejda Mandrescu
 */
const StaticAssetsUtils = {
  getStaticImagePath(...imgPathParts) {
    return FileManager.getFullPathForBuiltInResources(Constants.STATIC_DIR, Constants.IMAGES_DIR, ...imgPathParts);
  },

  getDocIconPath(iconFileName) {
    return this.getStaticImagePath(Constants.DOC_ICONS, iconFileName);
  },

  getMigrationsPath() {
    return FileManager.getFullPathForBuiltInResources(Constants.STATIC_DIR, Constants.DB_STATIC_DIR,
      Constants.MIGRATIONS_DIR);
  },
};

export default StaticAssetsUtils;
