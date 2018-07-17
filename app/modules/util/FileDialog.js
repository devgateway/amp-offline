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
      return dstFilePath;
    } catch (error) {
      logger.error(error);
    }
    return null;
  },

  /**
   * Opens electron dialog to choose file(s)
   * @see https://github.com/electron/electron/blob/master/docs/api/dialog.md
   * @param options
   * @return {string[]} file paths
   */
  openDialog(options = {}) {
    const files = DIALOG.showOpenDialog(options) || [];
    if (!files.length) {
      logger.warn('No file(s) selected');
    }
    return files;
  },

  /**
   * Opens electron dialog to choose a single file
   * @return {String} file path
   */
  openSingleFileDialog() {
    const files = this.openDialog({ multiSelections: false });
    return files.length ? files[0] : null;
  },

};

export default FileDialog;
