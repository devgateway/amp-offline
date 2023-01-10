import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import ElectronUpdater from './modules/update/ElectronUpdater';
import { IS_DEV_MODE, SHOW_SANITY_APP_DEBUG_WINDOW, SKIP_SANITY_CHECK } from './modules/util/ElectronApp';
import {
  CLOSE_SANITY_APP_AND_LOAD_MAIN,
  FORCE_CLOSE_APP,
  SHOW_SANITY_APP
} from './utils/constants/ElectronAppMessages';
import {
  CLOSE_HELP_WINDOW_MSG,
  CREATE_PDF_WINDOW_MSG,
  INITIALIZATION_COMPLETE_MSG
} from './utils/constants/MainDevelopmentConstants';

const PDFWindow = require('electron-pdf-window');

const skipSanityCheck = IS_DEV_MODE && SKIP_SANITY_CHECK;

let mainWindow = null;
let sanityCheckWindow = null;
let splash = null;
const isMacOS = process.platform === 'darwin';
let willQuitApp = !isMacOS;

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
  sanityCheckWindow = skipSanityCheck ? null : new BrowserWindow({
    show: false,
    width: 640,
    height: 200,
    center: true,
    useContentSize: true,
    closable: false,
    resizable: SHOW_SANITY_APP_DEBUG_WINDOW,
    frame: SHOW_SANITY_APP_DEBUG_WINDOW,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // create a new `splash`-Window
  splash = new BrowserWindow({
    width: 425,
    height: 285,
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

  const loadMainApp = () => {
    mainWindow.loadURL(`file://${__dirname}/app.html`);
    if (IS_DEV_MODE) {
      mainWindow.openDevTools();
    }
  };

  if (skipSanityCheck) {
    loadMainApp();
  } else {
    sanityCheckWindow.loadURL(`file://${__dirname}/app.html?sanity=true`);

    sanityCheckWindow.webContents.on('did-finish-load', () => {
      ipcMain.on(SHOW_SANITY_APP, () => {
        sanityCheckWindow.show();
        sanityCheckWindow.focus();
      });
    });

    ipcMain.on(CLOSE_SANITY_APP_AND_LOAD_MAIN, () => {
      closeWindow(sanityCheckWindow);
      sanityCheckWindow = null;
      loadMainApp();
    });

    // if sanity app is closed normally, we .destroy() it that won't trigger a 'close' event
    sanityCheckWindow.on('close', () => closeApp());

    sanityCheckWindow.setMenu(null);
  }

  ipcMain.on(FORCE_CLOSE_APP, () => {
    closeApp();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    // Delay showing the main window (blank) until ampOfflineStartUp() is complete.
    ipcMain.on(INITIALIZATION_COMPLETE_MSG, () => {
      if (splash) {
        splash.hide();
        splash.destroy();
        splash = null;
      }
      mainWindow.setAlwaysOnTop(false);
      mainWindow.show();
      mainWindow.focus();
      global.MAIN_WINDOW_ACTIVE = true;
    });
  });

  mainWindow.on('close', (event) => {
    if (!willQuitApp) {
      mainWindow.hide();
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Close help window if needed.
    if (global.HELP_PDF_WINDOW) {
      global.HELP_PDF_WINDOW.close();
    }
  });

  // we need to explicitly set application menu in MacOS to enable there Copy & Paste shortcuts
  // there are libs that can configure entire menu, but since we want to rather stick to AmpOffline menu, limiting to:
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteandmatchstyle' },
          { role: 'delete' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Open',
            accelerator: 'Cmd+0',
            selector: 'unhideAllApplications:',
            // eslint-disable-next-line
            click: function() {
              mainWindow.show();
            }
          },
          {
            label: 'Hide',
            accelerator: 'Cmd+H',
            selector: 'hide:'
          },
          {
            label: 'Minimize',
            accelerator: 'Cmd+M',
            selector: 'performMiniaturize:'
          },
          {
            label: 'Close',
            accelerator: 'Cmd+W',
            // eslint-disable-next-line
            click: function() {
              mainWindow.hide();
            }
          },
          {
            label: 'Quit',
            accelerator: 'Cmd+Q',
            // eslint-disable-next-line
            click: function() {
              app.quit();
            }
          }
        ]
      }
    ]));
  }

  if (process.env.NODE_ENV === 'development') {
    if (!skipSanityCheck && SHOW_SANITY_APP_DEBUG_WINDOW) {
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
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  willQuitApp = true;
});

// Listen to message from renderer process.
ipcMain.on(CREATE_PDF_WINDOW_MSG, (event, url) => {
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
        mainWindow.webContents.send(CLOSE_HELP_WINDOW_MSG);
      }
    });

    global.HELP_PDF_WINDOW = pdfWindow;
  }
  global.HELP_PDF_WINDOW.loadURL(url);
  return global.HELP_PDF_WINDOW;
});

const closeApp = () => {
  [sanityCheckWindow, mainWindow, splash].forEach(closeWindow);
  app.quit();
};

const closeWindow = (window) => {
  if (window) {
    window.hide();
    window.destroy();
  }
};
