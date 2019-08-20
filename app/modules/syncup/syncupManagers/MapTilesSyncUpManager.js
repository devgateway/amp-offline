/* eslint-disable class-methods-use-this */
import extract from 'extract-zip';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { MAP_TILES_URL } from '../../connectivity/AmpApiConstants';
import {
  TILES_ZIP_FILE, ASSETS_DIRECTORY, SYNCUP_TYPE_MAP_TILES, MAP_TILES_DIR
} from '../../../utils/Constants';
import FileManager from '../../util/FileManager';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Map tiles manager');

export default class MapTilesSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_MAP_TILES);
  }

  doAtomicSyncUp() {
    return new Promise((resolve, reject) => {
      // Just in case something fails when dealing with file/dir operations.
      try {
        MapTilesSyncUpManager.cleanup(true);
        FileManager.createDataDir(ASSETS_DIRECTORY, MAP_TILES_DIR);
        const start = new Date();
        const writeStream = FileManager.createWriteStream(ASSETS_DIRECTORY, TILES_ZIP_FILE);
        return ConnectionHelper.doGet({ url: MAP_TILES_URL, shouldRetry: true, writeStream }).then(() => {
          logger.info(`Tiles downloaded in: ${new Date() - start}ms`);
          // Extract .zip file using absolute paths.
          const zipFile = FileManager.getAbsolutePath(ASSETS_DIRECTORY, TILES_ZIP_FILE);
          const dir = FileManager.getAbsolutePath(ASSETS_DIRECTORY);
          return extract(zipFile, { dir }, MapTilesSyncUpManager.afterExtract.bind(null, resolve, reject));
        }).catch((error) => {
          logger.error(error);
          return reject(error);
        });
      } catch (e) {
        logger.error(e);
        return reject(e);
      }
    });
  }

  static afterExtract(resolve, reject, e) {
    MapTilesSyncUpManager.cleanup(false);
    if (e) {
      logger.error(e);
      return reject();
    }
    return resolve();
  }

  static cleanup(dirToo) {
    FileManager.deleteFileSync(FileManager.getFullPath(ASSETS_DIRECTORY, TILES_ZIP_FILE));
    if (dirToo) {
      FileManager.rmNotEmptyDirSync(ASSETS_DIRECTORY, MAP_TILES_DIR);
    }
  }
}
