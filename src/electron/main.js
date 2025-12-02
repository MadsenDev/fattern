const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { FatternDatabase } = require('../db/fatternDatabase');
const { registerDatabaseHandlers } = require('./dbHandlers');

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
let database;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Fattern',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '..', '..', 'dist', 'ui', 'index.html');
    win.loadFile(indexPath);
  }
}

function setupDatabase() {
  database = new FatternDatabase();
  registerDatabaseHandlers(database);
}

function disposeDatabase() {
  database?.close();
  database = null;
}

app.whenReady().then(() => {
  setupDatabase();
  createWindow();

  ipcMain.handle('ping', () => 'pong');
  ipcMain.handle('system:get-locale', () => app.getLocale());

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    disposeDatabase();
    app.quit();
  }
});

app.on('before-quit', () => {
  disposeDatabase();
});
