import FileManager from '../../app/modules/util/FileManager';
import { ASSETS_DIRECTORY, MAP_TILES_DIR } from './Constants';

const MapTilesUtils = {

  detectContent() {
    const dir = FileManager.readdirSync(ASSETS_DIRECTORY, MAP_TILES_DIR);
    return (dir && dir.length > 0);
  }

};

module.exports = MapTilesUtils;
