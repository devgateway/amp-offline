/* eslint-disable class-methods-use-this */
import { Constants } from 'amp-ui';
import extract from 'extract-zip';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { MAP_TILES_URL } from '../../connectivity/AmpApiConstants';
import FileManager from '../../util/FileManager';
import Logger from '../../util/LoggerManager';

const logger = new Logger('Map tiles manager');

export default class MapTilesSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(Constants.SYNCUP_TYPE_MAP_TILES);
  }

  doAtomicSyncUp() {
    return new Promise((resolve, reject) => {
      // Just in case something fails when dealing with file/dir operations.
      let writeStream;
      try {
        MapTilesSyncUpManager.cleanup(true);
        logger.log('creating map-tiles directory');
        FileManager.createDataDir(Constants.ASSETS_DIRECTORY, Constants.MAP_TILES_DIR);
        const start = new Date();
        logger.log('creating map-tiles.zip write stream for download');
        writeStream = FileManager.createWriteStream(Constants.ASSETS_DIRECTORY, Constants.TILES_ZIP_FILE);
        logger.log('starting map-tiles.zip download');
        return ConnectionHelper.doGet({ url: MAP_TILES_URL, shouldRetry: true, writeStream }).then(() => {
          logger.log(`Tiles downloaded in: ${new Date() - start} ms`);
          // Extract .zip file using absolute paths.
          const zipFile = FileManager.getAbsolutePath(Constants.ASSETS_DIRECTORY, Constants.TILES_ZIP_FILE);
          const dir = FileManager.getAbsolutePath(Constants.ASSETS_DIRECTORY, Constants.MAP_TILES_DIR);
          return extract(zipFile, { dir }, MapTilesSyncUpManager.afterExtract.bind(null, resolve, reject));
        }).catch((error) => {
          MapTilesSyncUpManager.onError(writeStream, error);
          return reject(error);
        });
      } catch (e) {
        MapTilesSyncUpManager.onError(writeStream, e);
        return reject(e);
      }
    });
  }

  static onError(writeStream, error) {
    logger.log('onError');
    logger.error(error);
    if (writeStream) {
      writeStream.destroy();
    }
  }

  static afterExtract(resolve, reject, e) {
    logger.log('afterExtract');
    MapTilesSyncUpManager.cleanup(false);
    if (e) {
      logger.error(`An error occurred during extraction ${e}`);
      return reject(e);
    }
    return resolve();
  }

  static cleanup(dirToo) {
    logger.log(`cleanup, ${dirToo ? 'including' : 'excluding'} map tiles directory`);
    FileManager.deleteFileSync(FileManager.getFullPath(Constants.ASSETS_DIRECTORY, Constants.TILES_ZIP_FILE));
    if (dirToo) {
      FileManager.rmNotEmptyDirSync(Constants.ASSETS_DIRECTORY, Constants.MAP_TILES_DIR);
    }
  }
}
