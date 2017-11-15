import { ipcRenderer } from 'electron';
import Logger from '../modules/util/LoggerManager';

const path = require('path');
const url = require('url');

const logger = new Logger('Settings Action');

export function loadHelp() {
  // todo: mover la carga del pdf a un util.
  logger.log('saveSettings');
  const fileLocation = url.format({
    pathname: path.join('C:', 'amp', 'amp-help.pdf'),
    protocol: 'file:',
    slashes: false
  });
  console.log(fileLocation);
  ipcRenderer.send('createPDFWindow', fileLocation);
  return (dispatch) => (
    dispatch({ type: 'nada' })
  );
}
