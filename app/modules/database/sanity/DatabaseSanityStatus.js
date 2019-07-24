import * as SCC from '../../../utils/constants/SanityCheckConstants';
import DatabaseSanityStatusDetails from './DatabaseSanityStatusDetails';
import Logger from '../../util/LoggerManager';
import { VERSION } from '../../../utils/Constants';

const logger = new Logger('DatabaseSanityStatus');

/**
 * @author Nadejda Mandrescu
 */
export default class DatabaseSanityStatus {

  static fromDB(dbStatus) {
    if (dbStatus) {
      const s = new DatabaseSanityStatus();
      Object.assign(s, dbStatus);
      s.details = new DatabaseSanityStatusDetails();
      Object.assign(s.details, dbStatus[SCC.STATUS_DETAILS]);
      return s;
    }
    return dbStatus;
  }

  constructor(type: string) {
    logger.log('constructor');
    if (type) {
      this.statusType = type;
      this.appVersion = VERSION;
      this.healStatus = SCC.STATUS_NOT_STARTED;
      if (!this.isPostUpgrade) {
        this.isDBIncompatibilityExpected = false;
      }
    }
    this.isSanityDBCorrupted = false;
  }

  set statusType(type: String) {
    this[SCC.TYPE] = type;
  }

  get statusType() {
    return this[SCC.TYPE];
  }

  get isPostUpgrade() {
    return this.statusType === SCC.TYPE_POST_UPGRADE;
  }

  set isSanityDBCorrupted(sanityDBIsCorrupted) {
    this[SCC.IS_SANITY_DB_CORRUPTED] = sanityDBIsCorrupted;
  }

  get isSanityDBCorrupted() {
    return this[SCC.IS_SANITY_DB_CORRUPTED];
  }

  set appVersion(version) {
    this[SCC.VERSION] = version;
  }

  get appVersion() {
    return this[SCC.VERSION];
  }

  set isDBIncompatibilityExpected(isExpected: boolean) {
    this[SCC.DB_INCOMPATIBILITY_EXPECTED] = isExpected;
  }

  get isDBIncompatibilityExpected() {
    return this[SCC.DB_INCOMPATIBILITY_EXPECTED];
  }

  set isDBIncompatibilityDetected(isDetected: boolean) {
    this[SCC.DB_INCOMPATIBILITY_DETECTED] = isDetected;
  }

  get isDBIncompatibilityDetected() {
    return this[SCC.DB_INCOMPATIBILITY_DETECTED];
  }

  set validatedAt(validatedAt: string) {
    this[SCC.DB_VALIDATED_AT] = validatedAt;
  }

  get validatedAt() {
    return this[SCC.DB_VALIDATED_AT];
  }

  set healedBy(healedBy: string) {
    this[SCC.DB_HEALED_BY] = healedBy;
  }

  get healedBy() {
    return this[SCC.DB_HEALED_BY];
  }

  set healedAt(healedAt: string) {
    this[SCC.DB_HEALED_AT] = healedAt;
  }

  get healedAt() {
    return this[SCC.DB_HEALED_AT];
  }

  set healStatus(healStatus: string) {
    this[SCC.DB_HEAL_STATUS] = healStatus;
  }

  get healStatus() {
    return this[SCC.DB_HEAL_STATUS];
  }

  get isHealedSuccessfully() {
    return this.healStatus === SCC.STATUS_SUCCESS;
  }

  get isHealFailed() {
    return this.healStatus === SCC.STATUS_FAIL;
  }

  get healReason() {
    return this[SCC.DB_HEAL_REASON];
  }

  set healReason(healReason: string) {
    this[SCC.DB_HEAL_REASON] = healReason;
  }

  set details(details: DatabaseSanityStatusDetails) {
    this[SCC.STATUS_DETAILS] = details;
  }

  /**
   * @returns {DatabaseSanityStatusDetails}
   */
  get details() {
    return this[SCC.STATUS_DETAILS];
  }

  get isEntireDBCorrupted() {
    const d:DatabaseSanityStatusDetails = this.details;
    return d && d.corruptedDBNames && d.corruptedDBNames.length === d.totalDBFilesFound;
  }
}
