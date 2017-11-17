import { ipcRenderer, remote } from 'electron';
import os from 'os';
import path from 'path';
import Logger from '../modules/util/LoggerManager';
import FileManager from '../modules/util/FileManager';
import Utils from '../utils/Utils';
import { HELP_PDF_FILENAME } from '../utils/Constants';

export const STATE_OPEN_HELP_WINDOW = 'STATE_OPEN_HELP_WINDOW';

const logger = new Logger('Help Action');
const fs = remote.require('fs');

export function loadHelp() {
  logger.log('loadHelp');
  // We need to move/extract (depending if we run on prod or dev) the help pdf in order to open it.
  const to = path.join(os.tmpdir(), `${Utils.numberRandom()}-${HELP_PDF_FILENAME}`);
  const from = FileManager.getFullPathForBuiltInResources(HELP_PDF_FILENAME);
  logger.debug(from);
  logger.debug(to);
  /* Node 6.x doesnt have a function to copy files and fs-extra is not finding the original pdf inside the .asar, so
   we are using old fs functions, notice if we upgrade Node we might need to use fs.copyFileSync instead. */
  fs.writeFileSync(to, fs.readFileSync(from));
  // We cant load pdf with relative path and reading directly from .asar didnt work consistently so we use a temp file.
  ipcRenderer.send('createPDFWindow', encodeURIComponent(to));

  /* An alternative option if rendering pdf inside chrome fails is to rely on the client's pdf reader:
   * 1) const { exec } = require('child_process');
   * 2) exec(to); */

  return (dispatch) => (
    dispatch({ type: STATE_OPEN_HELP_WINDOW })
  );
}
