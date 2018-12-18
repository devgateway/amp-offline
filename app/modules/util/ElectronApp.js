import { ipcRenderer } from 'electron';
import { FORCE_CLOSE_APP_MSG } from '../../utils/constants/MainDevelopmentConstants';

const { app, remote, shell, dialog } = require('electron');

/** electron "app" instance in either main or remote rendering process */
export const ELECTRON_APP = app || (remote && remote.app);
/** Tells if the current process is Renderer process. Otherwise it is the main process. */
export const IS_RENDERER_PROCESS = process && process.type === 'renderer';
/** Tells if the app is running in development mode. */
export const IS_DEV_MODE = process.env.NODE_ENV === 'development';
/** Tells if the app is running in "test" mode. */
export const IS_TEST_MODE = process.env.NODE_ENV === 'test';
/** Tells if to print logs to the console (for test mode). */
export const IS_LOG_TO_CONSOLE = +process.env.LOG_TO_CONSOLE;
/** Tells if actually to force the logging to the file even if in dev mode */
export const IS_FORCE_LOGGER = process.env.FORCE_LOGGER === 'true';
/** Tells if to enable the URL checks trigger */
export const IS_CHECK_URL_CHANGES = !IS_DEV_MODE || +process.env.CHECK_URL_CHANGES;
/** Controls whether to run changelogs or not */
export const IS_RUN_CHANGELOGS = !(+process.env.DISABLE_CHANGELOGS);
/** electron "shell" that provides functions related to desktop integration */
export const SHELL = shell || (remote && remote.shell);
/** electron dialog to display OS specific open/save files dialog */
export const DIALOG = dialog || (remote && remote.dialog);

export const forceCloseApp = () => ipcRenderer.send(FORCE_CLOSE_APP_MSG);
