import { ActivityConstants, Constants } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Program helper');

const ProgramHelper = {
  findAllWithProgramMapping(field) {
    logger.debug('findAllWithProgramMapping');
    const filter = { id: `${field}~${ActivityConstants.PROGRAM}` };
    return DatabaseManager.findAll(filter, Constants.COLLECTION_POSSIBLE_VALUES, null).then(data => {
      if (data && data[0]) {
        const ret = [];
        const ids = Object.keys(data[0]['possible-options']);
        ids.forEach(i => {
          const programId = data[0]['possible-options'][i].extra_info['mapped-program-id'];
          if (programId) {
            ret.push(programId);
          }
        });
        return ret;
      }
      return [];
    });
  }
};

export default ProgramHelper;
