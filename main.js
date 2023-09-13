const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "/src/preload.js"),
    },
  });

  // 加载主页
  mainWindow.loadURL(`file://${__dirname}/src/index.html`);

  // 监听窗口关闭事件
  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  // 监听从渲染进程发送的打开文件对话框请求
  ipcMain.on("open-file-dialog", handleOpenFileDialog);
}

/**
 * 处理打开文件对话框请求
 * @param {Electron.Event} event - 事件对象
 */
async function handleOpenFileDialog(event) {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (!result.canceled) {
      event.sender.send("selected-directory", result.filePaths[0]);
    }
  } catch (err) {
    console.error(err);
  }
}

// 应用程序准备就绪时创建主窗口
app.whenReady().then(createWindow);

// 监听所有窗口关闭事件，除非在 macOS 上
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
