/* eslint-disable class-methods-use-this */
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { MAP_TILES_URL } from '../../connectivity/AmpApiConstants';
import { TILES_ZIP_FILE, ASSETS_DIRECTORY, SYNCUP_TYPE_ASSETS, MAP_TILES_DIR } from '../../../utils/Constants';
import FileManager from '../../util/FileManager';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Map tiles manager');

export default class MapTilesSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_ASSETS);
  }

  doAtomicSyncUp() {
    return new Promise((resolve, reject) => {
      if (!this.checkIfTilesExist()) {
        return ConnectionHelper.doGet({ url: MAP_TILES_URL, shouldRetry: true }).then((tiles) => {
          FileManager.writeDataFileSync(tiles, ASSETS_DIRECTORY, TILES_ZIP_FILE);
          const dir = FileManager.getFullPath('..', ASSETS_DIRECTORY);
          return FileManager.extractZip(dir, this.afterExtract.bind(null, resolve, reject)
            , '..', ASSETS_DIRECTORY, TILES_ZIP_FILE);
        });
      } else {
        return resolve();
      }
    });
  }

  checkIfTilesExist() {
    return FileManager.existsSync(ASSETS_DIRECTORY, MAP_TILES_DIR);
  }

  afterExtract(resolve, reject, e) {
    if (e) {
      logger.error(e);
      return reject();
    }
    FileManager.deleteFile(FileManager.getFullPath(ASSETS_DIRECTORY, TILES_ZIP_FILE));
    return resolve();
  }
}
