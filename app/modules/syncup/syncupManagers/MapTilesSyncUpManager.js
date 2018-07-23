/* eslint-disable class-methods-use-this */
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { MAP_TILES_URL } from '../../connectivity/AmpApiConstants';
import { TILES_ZIP_FILE, ASSETS_DIRECTORY, SYNCUP_TYPE_ASSETS } from '../../../utils/Constants';
import FileManager from '../../util/FileManager';

export default class MapTilesSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_ASSETS);
  }

  doAtomicSyncUp() {
    return ConnectionHelper.doGet({ url: MAP_TILES_URL, shouldRetry: true }).then((tiles) => {
      // FileManager.createDataDir(ASSETS_DIRECTORY, MAP_TILES_DIR);
      FileManager.writeDataFileSync(tiles, ASSETS_DIRECTORY, TILES_ZIP_FILE);
      const dir = FileManager.getFullPath('..', ASSETS_DIRECTORY);
      return FileManager.extractZip(dir, ((e) => (alert(e))), '..', ASSETS_DIRECTORY, TILES_ZIP_FILE);
    });
  }
}
