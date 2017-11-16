import { ipcRenderer, remote } from 'electron';
import os from 'os';
import path from 'path';
import url from 'url';
import Logger from '../modules/util/LoggerManager';
import FileManager from '../modules/util/FileManager';
import Utils from '../utils/Utils';
import { HELP_DIRECTORY, ASSETS_DIRECTORY, HELP_PDF_FILENAME, APP_DIRECTORY } from '../utils/Constants';

export const STATE_OPEN_HELP_WINDOW = 'STATE_OPEN_HELP_WINDOW';

const logger = new Logger('Help Action');
const fs = remote.require('fs'); //TODO: si anda pasarlo a fs-extra.
const { exec } = require('child_process');

export function loadHelp() {
  logger.log('loadHelp');
  // We need to move/extract (depending if we run on prod or dev) the help pdf in order to open it.
  const to = path.join(os.tmpdir(), `${Utils.numberRandom()}-${HELP_PDF_FILENAME}`);
  const from = FileManager.getFullPathForBuiltInResources(HELP_PDF_FILENAME);
  logger.log(from);
  logger.log(to);
  /* Node 6.x doesnt have a function to copy files and fs-extra is not finding the original pdf inside the .asar, so
   we are using old fs functions, notice if we upgrade Node we might need to use fs.copyFileSync instead. */
  fs.writeFileSync(to, fs.readFileSync(from));
  // fs.copyFileSync(from, to);
  const fileLocation = url.format({
    pathname: to,
    protocol: 'file:',
    slashes: false
  });
  // alert(fileLocation);
  // ipcRenderer.send('createPDFWindow', fileLocation);
  exec(to);
  return (dispatch) => (
    dispatch({ type: STATE_OPEN_HELP_WINDOW })
  );
}
