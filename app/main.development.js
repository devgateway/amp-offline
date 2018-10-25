import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import ElectronUpdater from './modules/update/ElectronUpdater';
import { IS_DEV_MODE, SHOW_SANITY_APP_DEBUG_WINDOW } from './modules/util/ElectronApp';
import {
  CLOSE_SANITY_APP,
  FORCE_CLOSE_APP,
  SHOW_SANITY_APP,
  START_MAIN_APP
} from './utils/constants/ElectronAppMessages';

const PDFWindow = require('electron-pdf-window');

let mainWindow = null;
let sanityCheckWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install();
}

// if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const installExtensions = async () => {
  // if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) { // eslint-disable-line
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  }
};

app.on('ready', async () => {
  sanityCheckWindow = new BrowserWindow({
    show: false,
    width: 640,
    height: 200,
    center: true,
    useContentSize: true,
    closable: false,
    resizable: SHOW_SANITY_APP_DEBUG_WINDOW,
    frame: SHOW_SANITY_APP_DEBUG_WINDOW
  });

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  // create a new `splash`-Window
  const splash = new BrowserWindow({
    width: 425,
    height: 325,
    transparent: false,
    frame: false,
    titleBarStyle: 'hidden',
    alwaysOnTop: false,
    resizable: false,
    show: false,
    delay: 100,
    backgroundColor: '#2b669a',
    movable: false,
    closable: false
  });
  splash.loadURL(`file://${__dirname}/splash-screen.html`);
  splash.once('ready-to-show', () => {
    splash.show();
  });

  await installExtensions();

  sanityCheckWindow.loadURL(`file://${__dirname}/app.html?sanity=true`);

  sanityCheckWindow.webContents.on('did-finish-load', () => {
    ipcMain.on(SHOW_SANITY_APP, () => {
      sanityCheckWindow.show();
      sanityCheckWindow.focus();
    });
  });

  ipcMain.on(CLOSE_SANITY_APP, () => {
    closeWindow(sanityCheckWindow);
    sanityCheckWindow = null;
  });

  ipcMain.on(START_MAIN_APP, () => {
    mainWindow.loadURL(`file://${__dirname}/app.html`);
    if (IS_DEV_MODE) {
      mainWindow.openDevTools();
    }
  });

  // if sanity app is closed normally, we .destroy() it that won't trigger a 'close' event
  sanityCheckWindow.on('close', () => closeApp());

  ipcMain.on(FORCE_CLOSE_APP, () => {
    closeApp();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    splash.hide();
    splash.destroy();
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Close help window if needed.
    if (global.HELP_PDF_WINDOW) {
      global.HELP_PDF_WINDOW.close();
    }
  });

  if (process.env.NODE_ENV === 'development') {
    if (SHOW_SANITY_APP_DEBUG_WINDOW) {
      sanityCheckWindow.maximize();
      sanityCheckWindow.openDevTools();
    }

    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }

  ElectronUpdater.getElectronUpdater();

  mainWindow.setMenu(null);
  sanityCheckWindow.setMenu(null);
});

// Listen to message from renderer process.
ipcMain.on('createPDFWindow', (event, url) => {
  if (!global.HELP_PDF_WINDOW) {
    // Define a window capable of showing a pdf file in main process because it doesnt work on render process.
    let pdfWindow = new PDFWindow({
      show: true,
      webPreferences: {
        webSecurity: false
      }
    });
    pdfWindow.setMenu(null);

    pdfWindow.on('closed', () => {
      pdfWindow = null;
      global.HELP_PDF_WINDOW = null;
      // Use IPC to communicate with renderer process.
      if (mainWindow) {
        mainWindow.webContents.send('closeHelpWindow');
      }
    });

    global.HELP_PDF_WINDOW = pdfWindow;
  }
  global.HELP_PDF_WINDOW.loadURL(url);
  return global.HELP_PDF_WINDOW;
});

const closeApp = () => {
  [sanityCheckWindow, mainWindow].forEach(closeWindow);
  app.quit();
};

const closeWindow = (window) => {
  if (window) {
    window.hide();
    window.destroy();
  }
};
