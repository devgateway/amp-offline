import { ipcRenderer } from 'electron';
import { Constants } from 'amp-ui';
import Logger from '../modules/util/LoggerManager';
import FileManager from '../modules/util/FileManager';
import store from '../index';
import {
  CLOSE_HELP_WINDOW_MSG,
  CREATE_PDF_WINDOW_MSG
} from '../utils/constants/MainDevelopmentConstants';

export const STATE_HELP_WINDOW_OPEN = 'STATE_HELP_WINDOW_OPEN';
export const STATE_HELP_WINDOW_CLOSED = 'STATE_HELP_WINDOW_CLOSED';

const logger = new Logger('Help Action');

export function loadHelp() {
  logger.log('loadHelp');
  // We need to move/extract (depending if we run on prod or dev) the help pdf in order to open it.
  /* We cant load the pdf with a relative path (dev mode) so we use a temp file to be consistent (we could
  open it from the .asar in prod mode). */
  const fileName = `${Constants.HELP_PDF_FILENAME}-${store.getState().translationReducer.lang}.pdf`;
  const fromDir = FileManager.getFullPathForBuiltInResources(Constants.STATIC_DIR, Constants.HELP_DIR);
  const to = FileManager.copyDataFileToTmpSync(fileName, fromDir);
  logger.debug(to);
  ipcRenderer.send(CREATE_PDF_WINDOW_MSG, encodeURIComponent(to));

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
ipcRenderer.on(CLOSE_HELP_WINDOW_MSG, (event, args) => {
  closeHelpState();
});
