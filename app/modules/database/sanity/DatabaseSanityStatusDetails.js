import * as SCC from '../../../utils/constants/SanityCheckConstants';

/**
 * @author Nadejda Mandrescu
 */
export default class DatabaseSanityStatusDetails {
  /**
   * @param corruptedDBs the DB names (e.g. ['activity']) found corrupted
   * @param totalDBFiles the number of validated DB files for corruption
   */
  constructor(corruptedDBs, totalDBFiles) {
    this.corruptedDBNames = corruptedDBs;
    this.totalDBFilesFound = totalDBFiles;
  }

  /**
   * @param corruptedDBNames the corrupted DB names (e.g. ['activity']) found initially as part of this sanity check
   */
  set corruptedDBNames(corruptedDBNames: Array<string>) {
    this[SCC.CORRUPTED_DB_NAMES] = corruptedDBNames;
  }

  /**
   * @returns {[string]} the corrupted DB names (e.g. ['activity']) found initially as part of this sanity check
   */
  get corruptedDBNames() {
    return this[SCC.CORRUPTED_DB_NAMES];
  }

  /**
   * @param remainingCorruptedDBNames the corrupted DB names remaining during the current sanity check reattempt
   */
  set remainingCorruptedDBNames(remainingCorruptedDBNames: Array<string>) {
    this[SCC.REMAINING_CORRUPTED_DB_NAMES] = remainingCorruptedDBNames;
  }

  /**
   * @returns {[string]} the corrupted DB names remaining during the current sanity check reattempt
   */
  get remainingCorruptedDBNames() {
    return this[SCC.REMAINING_CORRUPTED_DB_NAMES];
  }

  /**
   * @param totalDBFilesFound the number of validated DB files for corruption
   */
  set totalDBFilesFound(totalDBFilesFound: number) {
    this[SCC.TOTAL_DB_FILES_FOUND] = totalDBFilesFound;
  }

  /**
   * @returns {number} the number of validated DB files for corruption
   */
  get totalDBFilesFound() {
    return this[SCC.TOTAL_DB_FILES_FOUND];
  }

}
