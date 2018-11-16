import Logger from '../../modules/util/LoggerManager';
import * as ElectronApp from '../../modules/util/ElectronApp';

/* TODO fix logging to console in dev mod through LoggerManager
const logger = new Logger('DB Migrations');
*/
const logger = ElectronApp.IS_DEV_MODE ? console : new Logger('DB Migrations');

export default logger;
