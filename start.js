const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  require('./main');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    require('./main');
  }
});
