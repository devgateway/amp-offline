import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import ElectronUpdater from './modules/update/ElectronUpdater';

const PDFWindow = require('electron-pdf-window');

let mainWindow = null;
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

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    splash.hide();
    splash.destroy();
    mainWindow.show();
    mainWindow.focus();
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
            click: function () {
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
            click: function () {
              mainWindow.hide();
            }
          },
          {
            label: 'Quit',
            accelerator: 'Cmd+Q',
            // eslint-disable-next-line
            click: function () {
              app.quit();
            }
          }
        ]
      }
    ]));
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
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
