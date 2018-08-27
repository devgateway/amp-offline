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
      MapTilesSyncUpManager.cleanup();
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
    });
  }

  static afterExtract(resolve, reject, e) {
    if (e) {
      logger.error(e);
      return reject();
    }
    return resolve();
  }

  static cleanup() {
    FileManager.deleteFileSync(FileManager.getFullPath(ASSETS_DIRECTORY, TILES_ZIP_FILE));
    FileManager.rmdirSync(ASSETS_DIRECTORY, MAP_TILES_DIR);
  }
}
