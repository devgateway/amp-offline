import { ipcRenderer } from 'electron';
import Logger from '../modules/util/LoggerManager';
import FileManager from '../modules/util/FileManager';
import { HELP_PDF_FILENAME, STATIC_DIR } from '../utils/Constants';
import store from '../index';

export const STATE_HELP_WINDOW_OPEN = 'STATE_HELP_WINDOW_OPEN';
export const STATE_HELP_WINDOW_CLOSED = 'STATE_HELP_WINDOW_CLOSED';

const logger = new Logger('Help Action');

export function loadHelp() {
  logger.log('loadHelp');
  // We need to move/extract (depending if we run on prod or dev) the help pdf in order to open it.
  /* We cant load the pdf with a relative path (dev mode) so we use a temp file to be consistent (we could
  open it from the .asar in prod mode). */
  const to = FileManager.copyDataFileToTmpSync(HELP_PDF_FILENAME, STATIC_DIR);
  logger.debug(to);
  ipcRenderer.send('createPDFWindow', encodeURIComponent(to), closeHelpState);

  /* An alternative option if rendering pdf inside chrome fails is to rely on the client's pdf reader:
   * 1) const { exec } = require('child_process');
   * 2) exec(to); */

  return (dispatch) => (
    dispatch({ type: STATE_HELP_WINDOW_OPEN })
  );
}

export function closeHelpState() {
  return store.dispatch({ type: STATE_HELP_WINDOW_CLOSED });
}

// Listen to message from main process.
/* eslint no-unused-vars: 0 */
ipcRenderer.on('closeHelpWindow', (event, args) => {
  closeHelpState();
});
