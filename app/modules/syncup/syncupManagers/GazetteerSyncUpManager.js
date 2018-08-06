/* eslint-disable class-methods-use-this */
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import Logger from '../../util/LoggerManager';
import {
  DB_FILE_PREFIX,
  SYNCUP_TYPE_GAZETTEER,
  COLLECTION_GAZETTEER,
  DB_FILE_EXTENSION
} from '../../../utils/Constants';
import { GAZETTEER_URL } from '../../connectivity/AmpApiConstants';
import FileManager from '../../util/FileManager';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import GazetteerHelper from '../../helpers/GazetteerHelper';

const logger = new Logger('Gazetteer manager');

export default class GazetteerSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(SYNCUP_TYPE_GAZETTEER);
  }

  doAtomicSyncUp() {
    logger.debug('doAtomicSyncUp');
    return new Promise((resolve, reject) => {
      if (!this.checkIfGazetteerExist()) {
        return ConnectionHelper.doGet({ url: GAZETTEER_URL, shouldRetry: true }).then((locations) => (
          GazetteerHelper.saveOrUpdateLocationCollection(locations).then(resolve).catch(reject)
        )).catch(reject);
      } else {
        return resolve();
      }
    });
  }

  checkIfGazetteerExist() {
    return FileManager.existsSync(DB_FILE_PREFIX, `${COLLECTION_GAZETTEER}${DB_FILE_EXTENSION}`);
  }
}
