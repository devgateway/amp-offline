import FileManager from '../../app/modules/util/FileManager';
import { ASSETS_DIRECTORY, MAP_TILES_DIR } from './Constants';

const MapTilesUtils = {

  detectContent() {
    if (FileManager.existsSync(ASSETS_DIRECTORY, MAP_TILES_DIR)) {
      const dir = FileManager.readdirSync(ASSETS_DIRECTORY, MAP_TILES_DIR);
      return (dir && dir.length > 0);
    }
    return false;
  },

  getMaxMinZoom() {
    let min = 999;
    let max = 0;
    if (this.detectContent()) {
      FileManager.readdirSync(ASSETS_DIRECTORY, MAP_TILES_DIR).forEach(name => {
        const numberMatch = name.match(/([0-9]+)/);
        if (numberMatch) {
          const auxNumberFileName = Number(name);
          if (auxNumberFileName > max) {
            max = auxNumberFileName;
          }
          if (auxNumberFileName < min) {
            min = auxNumberFileName;
          }
        }
      });
    }
    return { min, max };
  }

};

module.exports = MapTilesUtils;
