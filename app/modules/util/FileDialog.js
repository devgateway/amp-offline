import path from 'path';
import { DIALOG } from './ElectronApp';
import FileManager from './FileManager';
import Logger from './LoggerManager';

const logger = new Logger('FileDialog');

/**
 * File Dialog utility class
 *
 * @author Nadejda Mandrescu
 */
const FileDialog = {
  /**
   * Opens save dialog and copies the source file to the destination selected by the user
   * @param srcFilePath the source path of the file
   * @param srcFileTitle (optional) the file name to suggest to save as. If not specified, then the last path segment
   * of the srcFilePath will be used
   * @return {string} the destination path of the file
   */
  saveDialog(srcFilePath, srcFileTitle = null) {
    srcFileTitle = srcFileTitle || path.basename(srcFilePath);
    const defaultPath = path.join(FileManager.getDownloadPath(), srcFileTitle);
    const options = {
      defaultPath
    };
    const dstFilePath = DIALOG.showSaveDialog(options);
    if (!dstFilePath) {
      logger.warn('No destination file path was selection. Operation canceled.');
      return;
    }
    try {
      FileManager.copyDataFileSyncUsingFullPaths(srcFilePath, dstFilePath);
    } catch (error) {
      logger.error(error);
    }
  }
};

export default FileDialog;
