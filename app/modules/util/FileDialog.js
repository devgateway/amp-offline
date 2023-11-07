import path from 'path';
import { shell } from 'electron';
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
   * @return {string|undefined|null} the destination path of the file,
   *  undefined if no destination selected or null if a problem occured
   */
  saveDialog(srcFilePath, srcFileTitle = null) {
    srcFileTitle = srcFileTitle || path.basename(srcFilePath);
    const defaultPath = path.join(FileManager.getDownloadPath(), srcFileTitle);
    const options = {
      defaultPath
    };
    return DIALOG.showSaveDialog(options).then(res => {
      if (!res.canceled) {
        const dstFilePath = res.filePath;
        if (!dstFilePath) {
          logger.warn('No destination file path was selection. Operation canceled.');
          return null;
        }
        try {
          FileManager.copyDataFileSyncUsingFullPaths(srcFilePath, dstFilePath);
          shell.openPath(dstFilePath);
          return dstFilePath;
        } catch (error) {
          logger.error(error);
        }
      }
      return null;
    });
  },

  /**
   * Opens electron dialog to choose file(s)
   * @see https://github.com/electron/electron/blob/master/docs/api/dialog.md
   * @param options
   * @return {string[]} file paths
   */
  openDialog(options = {}) {
    return DIALOG.showOpenDialog(options);
  },

  /**
   * Opens electron dialog to choose a single file
   * @return {String} file path
   */
  openSingleFileDialog() {
    return this.openDialog({ multiSelections: false }
    ).then((filePaths) => {
      if (filePaths.filePaths === undefined) {
        logger.log('No file selected');
        return [];
      } else {
        logger.log('file:', filePaths.filePaths[0]);
        return filePaths.filePaths[0];
      }
    }).catch(err => {
      logger.log(err);
      return err;
    });
  }

};

export default FileDialog;
