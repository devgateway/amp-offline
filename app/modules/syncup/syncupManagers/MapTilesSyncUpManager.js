/* eslint-disable class-methods-use-this */
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import { MAP_TILES_URL } from '../../connectivity/AmpApiConstants';
import { AMP_COUNTRY_LOGO, ASSETS_DIRECTORY, SYNCUP_TYPE_ASSETS, MAP_TILES_DIR } from '../../../utils/Constants';
import FileManager from '../../util/FileManager';

export default class MapTilesSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_ASSETS);
  }

  doAtomicSyncUp() {
    return ConnectionHelper.doGet({ url: MAP_TILES_URL, shouldRetry: true }).then((image) => {
      FileManager.createDataDir(MAP_TILES_DIR);
      FileManager.writeDataFileSync(image, ASSETS_DIRECTORY, AMP_COUNTRY_LOGO);
      return null;
    });
  }
}
