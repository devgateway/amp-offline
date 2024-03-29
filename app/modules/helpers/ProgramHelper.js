import { ActivityConstants, Constants } from 'amp-ui';
import * as DatabaseManager from '../database/DatabaseManager';
import Logger from '../../modules/util/LoggerManager';

const logger = new Logger('Program helper');

const ProgramHelper = {
  /**
   * Find all mappings (if any) for a given program type (Primary, Secondary, etc).
   * @param field
   * @returns {*}
   */
  findAllWithProgramMapping(field) {
    logger.debug('findAllWithProgramMapping');
    const filter = this.getFilterByProgramClassification(field);
    return DatabaseManager.findAll(filter, Constants.COLLECTION_POSSIBLE_VALUES, null).then(data => {
      if (data && data[0]) {
        const ret = [];
        const ids = Object.keys(data[0]['possible-options']);
        ids.forEach(i => {
          const programId = data[0]['possible-options'][i].extra_info['mapped-program-id'];
          if (programId) {
            ret.push({ dst: programId, src: Number.parseInt(i, 10) });
          }
        });
        logger.info(ret);
        return ret;
      }
      return [];
    });
  },

  /**
   * Return the classification/type of a given program (NPO, PP, SP, TP, etc).
   * @param id
   * @returns {Promise<unknown>}
   */
  findProgramClassificationByProgramId(id) {
    logger.debug('findProgramClassificationByProgramId');
    return Promise.all([this.findClassification(ActivityConstants.NATIONAL_PLAN_OBJECTIVE, id),
      this.findClassification(ActivityConstants.PRIMARY_PROGRAMS, id),
      this.findClassification(ActivityConstants.SECONDARY_PROGRAMS, id),
      this.findClassification(ActivityConstants.TERTIAR_PROGRAMS, id)]).then(data => data.find(i => i));
  },

  /**
   * Check if a given program belongs to a given classification/type.
   * @param field
   * @param id
   * @returns {*}
   */
  findClassification(field, id) {
    logger.debug('findClassification');
    const filter = this.getFilterByProgramClassification(field);
    return DatabaseManager.findAll(filter, Constants.COLLECTION_POSSIBLE_VALUES).then(data => {
      if (data && data[0] && Object.keys(data[0]['possible-options']).find(item => item === `${id}`)) {
        return Promise.resolve(field);
      }
      return Promise.resolve(null);
    });
  },

  getFilterByProgramClassification(classification) {
    const filter = { id: `${classification}~${ActivityConstants.PROGRAM}` };
    logger.info(filter);
    return filter;
  },

  /**
   * Given a program (from any level), find all the parents up to level 0.
   * @param id
   */
  findParentStructure(program, fieldPath, ids) {
    logger.debug('findParentStructure');
    if (program && fieldPath) {
      if (program.parentId) {
        ids.push(program);
        const filter = this.getFilterByProgramClassification(fieldPath);
        return DatabaseManager.findOne(filter, Constants.COLLECTION_POSSIBLE_VALUES).then(data => {
          const parentProgram = data['possible-options'][program.parentId];
          return this.findParentStructure(parentProgram, fieldPath, ids);
        });
      } else {
        ids.push(program);
        return ids;
      }
    }
    ids.push(program);
    return ids;
  },

  /**
   * Find all programs for a given classification/type (ie: NPO, PP, SP, etc).
   * @param fieldPath
   * @returns {*}
   */
  findAllProgramsByClassification(fieldPath) {
    logger.debug('findProgramsByClassification');
    const filter = this.getFilterByProgramClassification(fieldPath);
    return DatabaseManager.findAll(filter, Constants.COLLECTION_POSSIBLE_VALUES);
  },

  hasRelatedProgram(id, src, dst, activity, type) {
    if (type === src) {
      const srcProgramExtraInfo = activity[src].find(i => i.program._id === id).program.extra_info;
      const dstPrograms = activity[dst];
      let ret = false;
      if (dstPrograms) {
        dstPrograms.forEach(i => {
          if (srcProgramExtraInfo['mapped-program-id']
            && srcProgramExtraInfo['mapped-program-id'].find(j => j === i.program._id)) {
            ret = true;
          }
        });
      }
      return ret;
    } else {
      return false;
    }
  },

  /**
   * Given an array of program ids return the same ids plus their parents up to level 0.
   * This is necessary to match the logic in AMP.
   * @param ids
   * @param programs
   * @returns {*}
   */
  findAllParents(ids, programs) {
    const newIds = [];
    ids.forEach(i => {
      let auxId = i.value;
      while (auxId) {
        const program = programs[0]['possible-options'][auxId];
        newIds.push({ path: 'id', value: auxId });
        auxId = program.parentId;
      }
    });
    return newIds;
  }
};

export default ProgramHelper;
