import FileManager from '../app/modules/util/FileManager';
import * as TC from './TestConstants';

/**
 * Common utility methods for unit tests
 *
 * @author Nadejda Mandrescu
 */
const TestUtils = {
  getTestMigrationsPath(testMigrationsSubDir) {
    return FileManager.getTestsPath(TC.MODULES_DIR, TC.MIGRATIONS_DIR, testMigrationsSubDir);
  }
};

export default TestUtils;
