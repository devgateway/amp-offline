import { DB_STATIC_DIR, DOC_ICONS, IMAGES_DIR, MIGRATIONS_DIR, STATIC_DIR } from './Constants';
import FileManager from '../modules/util/FileManager';

/**
 * Access to static assets
 *
 * @author Nadejda Mandrescu
 */
const StaticAssetsUtils = {
  getStaticImagePath(...imgPathParts) {
    return FileManager.getFullPathForBuiltInResources(STATIC_DIR, IMAGES_DIR, ...imgPathParts);
  },

  getDocIconPath(iconFileName) {
    return this.getStaticImagePath(DOC_ICONS, iconFileName);
  },

  getMigrationsPath() {
    return FileManager.getFullPathForBuiltInResources(STATIC_DIR, DB_STATIC_DIR, MIGRATIONS_DIR);
  },
};

export default StaticAssetsUtils;
