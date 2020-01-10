/* eslint-disable class-methods-use-this */
import { Constants } from 'amp-ui';
import AbstractAtomicSyncUpManager from './AbstractAtomicSyncUpManager';
import Logger from '../../util/LoggerManager';
import { GAZETTEER_URL } from '../../connectivity/AmpApiConstants';
import * as ConnectionHelper from '../../connectivity/ConnectionHelper';
import GazetteerHelper from '../../helpers/GazetteerHelper';

const logger = new Logger('Gazetteer manager');

export default class GazetteerSyncUpManager extends AbstractAtomicSyncUpManager {

  constructor() {
    super(Constants.SYNCUP_TYPE_GAZETTEER);
  }

  doAtomicSyncUp() {
    logger.debug('doAtomicSyncUp');
    return ConnectionHelper.doGet({ url: GAZETTEER_URL, shouldRetry: true }).then((locations) => (
      GazetteerHelper.replaceAllLocations(locations)
    ));
  }
}
