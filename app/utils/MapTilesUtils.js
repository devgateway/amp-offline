import FileManager from '../../app/modules/util/FileManager';
import { ASSETS_DIRECTORY, MAP_TILES_DIR } from './Constants';

const MapTilesUtils = {

  detectContent() {
    if (FileManager.existsSync(ASSETS_DIRECTORY, MAP_TILES_DIR)) {
      const dir = FileManager.readdirSync(ASSETS_DIRECTORY, MAP_TILES_DIR);
      return (dir && dir.length > 0);
    }
    return false;
  }

};

module.exports = MapTilesUtils;
