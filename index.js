const {app, BrowserWindow, globalShortcut} = require('electron')

function createWindow() {
    // 创建浏览器窗口
    win = new BrowserWindow({
        width: 800,
        height: 700,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true, // 这里是关键设置
        },
        webContents: {
            openDevTools: true   //不想要控制台直接把这段删除
        }
    });
    require('@electron/remote/main').initialize(); // 初始化
    require('@electron/remote/main').enable(win.webContents);
    win.loadFile('index.html')
    win.setMenu(null);
}

// 应用程序准备就绪后打开一个窗口
app.on('ready', async () => {
    globalShortcut.register('CommandOrControl+Shift+i', function () {
        win.webContents.openDevTools()
    });
    createWindow();
});
