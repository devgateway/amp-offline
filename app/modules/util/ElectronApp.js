import { ipcRenderer } from 'electron';
import { FORCE_CLOSE_APP_MSG } from '../../utils/constants/MainDevelopmentConstants';

const { app, remote, shell, dialog } = require('electron');

/** electron "app" instance in either main or remote rendering process */
export const ELECTRON_APP = app || (remote && remote.app);
/** Tells if the current process is Renderer process. Otherwise it is the main process. */
export const IS_RENDERER_PROCESS = process && process.type === 'renderer';
/** Tells if the app is running in development mode. */
export const IS_DEV_MODE = process.env.NODE_ENV === 'development';
/** Tells if to enable the URL checks trigger */
export const IS_CHECK_URL_CHANGES = !IS_DEV_MODE || +process.env.CHECK_URL_CHANGES;
/** electron "shell" that provides functions related to desktop integration */
export const SHELL = shell || (remote && remote.shell);
/** electron dialog to display OS specific open/save files dialog */
export const DIALOG = dialog || (remote && remote.dialog);

export const forceCloseApp = () => ipcRenderer.send(FORCE_CLOSE_APP_MSG);
