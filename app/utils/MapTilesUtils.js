import { Constants } from 'amp-ui';
import FileManager from '../../app/modules/util/FileManager';

const MapTilesUtils = {

  detectContent() {
    if (FileManager.existsSync(Constants.ASSETS_DIRECTORY, Constants.MAP_TILES_DIR)) {
      const dir = FileManager.readdirSync(Constants.ASSETS_DIRECTORY, Constants.MAP_TILES_DIR);
      return (dir && dir.length > 0);
    }
    return false;
  },

  getMaxMinZoom() {
    let min = 999;
    let max = 0;
    if (this.detectContent()) {
      FileManager.readdirSync(Constants.ASSETS_DIRECTORY, Constants.MAP_TILES_DIR).forEach(name => {
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
