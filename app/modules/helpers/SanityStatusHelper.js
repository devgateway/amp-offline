import * as DatabaseManager from '../database/DatabaseManager';
import { VERSION, COLLECTION_SANITY_CHECK } from '../../utils/Constants';
import * as Utils from '../../utils/Utils';
import Logger from '../../modules/util/LoggerManager';
import * as SCC from '../../utils/constants/SanityCheckConstants';

const logger = new Logger('SanityStatusHelper');

/**
 * A simplified helper for using Sanity Check storage.
 *
 * For each app version, there can be:
 * a) only one entry for type: transition
 * b) only one entry for type: post-upgrade
 * c) multiple entries for type: standard
 *
 * @author Nadejda Mandrescu
 */
const SanityStatusHelper = {

  /**
   * Finds DB transition sanity check status for the current app version
   * @return {Promise} DB transition sanity status
   */
  findCurrentVersionTransitionStatus() {
    logger.debug('findCurrentVersionTransitionStatus');
    const filter = Utils.toMap(SCC.VERSION, VERSION);
    filter[SCC.TYPE] = SCC.TYPE_TRANSITION;
    return DatabaseManager.findOne(filter, COLLECTION_SANITY_CHECK);
  },

  /**
   * Finds post-upgrade sanity check status for the current app version
   * @return {Promise} post upgrade sanity status
   */
  findCurrentVersionPostUpgradeStatus() {
    logger.debug('findCurrentVersionPostUpgradeStatus');
    const filter = Utils.toMap(SCC.VERSION, VERSION);
    filter[SCC.TYPE] = SCC.TYPE_POST_UPGRADE;
    return DatabaseManager.findOne(filter, COLLECTION_SANITY_CHECK);
  },

  /**
   * @returns {Promise} all other versions that were already healed
   */
  findAllOtherFixedVersions() {
    logger.debug('findAllOtherFixedVersions');
    const filter = Utils.toMap(SCC.DB_HEAL_STATUS, SCC.STATUS_SUCCESS);
    filter[SCC.VERSION] = { $ne: VERSION };
    return this.findAll(filter).then(otherStatuses => otherStatuses.map(s => s[SCC.VERSION]));
  },

  /**
   * Finds a pending standard sanity check status for the current app version
   * @returns {Promise}
   */
  findCurrentVersionPendingStandardStatus() {
    logger.debug('findCurrentVersionPendingStandardStatus');
    const filter = {};
    filter[SCC.TYPE] = SCC.TYPE_STANDARD;
    filter[SCC.VERSION] = VERSION;
    filter[SCC.DB_HEAL_STATUS] = { $ne: SCC.STATUS_SUCCESS };
    return DatabaseManager.findOne(filter, COLLECTION_SANITY_CHECK);
  },

  /**
   * @returns {Promise<boolean>} if there was any standard status check for the current version
   */
  hasCurrentVersionStandardStatus() {
    logger.debug('hasCurrentVersionStandardStatus');
    const filter = Utils.toMap(SCC.VERSION, VERSION);
    filter[SCC.TYPE] = SCC.TYPE_STANDARD;
    return DatabaseManager.count(filter, COLLECTION_SANITY_CHECK).then(count => count > 0);
  },

  /**
   * Finds all sanity statuses based on a filter criteria
   * @param filter
   * @returns {Promise}
   */
  findAll(filter) {
    logger.debug('findAll');
    return DatabaseManager.findAll(filter, COLLECTION_SANITY_CHECK);
  },

  /**
   * Saves or updates sanity status
   * @param sanityStatus
   * @return {Promise}
   */
  saveOrUpdate(sanityStatus) {
    logger.log('saveOrUpdate');
    if (!sanityStatus.id) {
      sanityStatus.id = Utils.stringToUniqueId('');
    }
    return DatabaseManager.saveOrUpdate(sanityStatus.id, sanityStatus, COLLECTION_SANITY_CHECK);
  },


  /**
   * Removes a sanity status entry id
   * @param id sanityStatus id
   * @return {Promise}
   */
  removeById(id) {
    logger.log('removeById');
    return DatabaseManager.removeById(id, COLLECTION_SANITY_CHECK);
  }

};

export default SanityStatusHelper;
