import { ipcRenderer } from 'electron';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import Logger from '../modules/util/LoggerManager';
import FileManager from '../modules/util/FileManager';
import Utils from '../utils/Utils';
import { HELP_DIRECTORY, ASSETS_DIRECTORY, HELP_PDF_FILENAME } from '../utils/Constants';

export const STATE_OPEN_HELP_WINDOW = 'STATE_OPEN_HELP_WINDOW';

const logger = new Logger('Help Action');

export function loadHelp() {
  logger.log('loadHelp');
  // We need to move/extract (depending if we run on prod or dev) the help pdf in order to open it.
  const to = path.join(os.tmpdir(), `${Utils.numberRandom()}-${HELP_PDF_FILENAME}`);
  const from = FileManager.getFullPathForBuiltInResources(ASSETS_DIRECTORY, HELP_DIRECTORY, HELP_PDF_FILENAME);
  fs.copySync(from, to);
  const fileLocation = url.format({
    pathname: to,
    protocol: 'file:',
    slashes: false
  });
  logger.log(to);
  ipcRenderer.send('createPDFWindow', fileLocation);
  return (dispatch) => (
    dispatch({ type: STATE_OPEN_HELP_WINDOW })
  );
}
