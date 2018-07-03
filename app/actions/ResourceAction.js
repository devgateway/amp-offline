import RepositoryHelper from '../modules/helpers/RepositoryHelper';
import { ORPHAN } from '../utils/constants/ResourceConstants';
import * as Utils from '../utils/Utils';
import ResourceManager from '../modules/resource/ResourceManager';
import Logger from '../modules/util/LoggerManager';

const logger = new Logger('ResourceAction');

// expecting more entries to export
/* eslint-disable import/prefer-default-export */
/**
 * Try to delete orphan content
 * @return {*|Promise<T>}
 */
export const deleteOrphanResources = () => {
  logger.log('deleteOrphanResources');
  const filter = Utils.toMap(ORPHAN, { $eq: true });
  return RepositoryHelper.findAllContents(filter)
    .then(contents => Promise.all(contents.map(c => ResourceManager.deleteContent(c))));
};
