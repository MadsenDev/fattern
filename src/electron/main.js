const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { FatternDatabase } = require('../db/fatternDatabase');
const { registerDatabaseHandlers } = require('./dbHandlers');
const { registerTemplateHandlers } = require('./templateHandlers');
const { generateInvoicePDF } = require('./pdfGenerator');
const { generateTemplatePDF } = require('./templatePdfGenerator');

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
let database;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Fattern',
    frame: false,
    titleBarStyle: 'hidden',
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
  
  // Register template handlers
  registerTemplateHandlers(ipcMain);
  
  // Window controls
  ipcMain.handle('window:minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });
  
  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });
  
  ipcMain.handle('window:close', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });
  
  ipcMain.handle('window:is-maximized', () => {
    const win = BrowserWindow.getFocusedWindow();
    return win ? win.isMaximized() : false;
  });

  // Dev tools toggle
  ipcMain.handle('window:toggle-devtools', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools();
      } else {
        win.webContents.openDevTools({ mode: 'detach' });
      }
    }
  });

  // Keyboard shortcut for dev tools (F12 or Ctrl+Shift+I)
  app.on('browser-window-created', (event, window) => {
    window.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
        if (window.webContents.isDevToolsOpened()) {
          window.webContents.closeDevTools();
        } else {
          window.webContents.openDevTools({ mode: 'detach' });
        }
      }
    });
  });

  // PDF generation
  ipcMain.handle('pdf:generate-invoice', async (event, invoiceId, templateId = null) => {
    try {
      const invoice = database.getInvoice(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const company = database.ensureCompany();
      const customer = invoice.customer_id
        ? database.db.prepare('SELECT * FROM customers WHERE id = ?').get(invoice.customer_id)
        : null;

      // If templateId is provided, use template-based generation
      if (templateId) {
        const { TemplateStorage } = require('../db/templateStorage');
        const templateStorage = new TemplateStorage();
        const template = templateStorage.loadTemplate(templateId);
        if (!template) {
          throw new Error('Template not found');
        }
        const filepath = await generateTemplatePDF(template, invoice, company, customer);
        return { success: true, filepath };
      }

      // Otherwise use the default PDF generator
      const filepath = await generateInvoicePDF(invoice, company, customer);
      return { success: true, filepath };
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  });

  ipcMain.handle('pdf:open-file', async (event, filepath) => {
    try {
      await shell.openPath(filepath);
      return { success: true };
    } catch (error) {
      console.error('Error opening file:', error);
      throw error;
    }
  });

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
