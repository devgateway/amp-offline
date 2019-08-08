const { app, remote, shell } = require('electron');

/** electron "app" instance in either main or remote rendering process */
export const ELECTRON_APP = app || (remote && remote.app);
/** Tells if the current process is Renderer process. Otherwise it is the main process. */
export const IS_RENDERER_PROCESS = process && process.type === 'renderer';
/** Tells if the app is running in development mode. */
export const IS_DEV_MODE = process.env.NODE_ENV === 'development';
/** Show debug window for sanity app */
export const SHOW_SANITY_APP_DEBUG_WINDOW = +process.env.SANITY_APP_DEBUG_WINDOW === 1;
/** electron "shell" that provides functions related to desktop integration */
export const SHELL = shell || (remote && remote.shell);

