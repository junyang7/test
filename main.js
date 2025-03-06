// 引入依赖
const {app, BrowserWindow} = require('electron');
const log = require('electron-log');
const path = require('path');

// 引入 Web 和 API 服务器模块
const Web = require('./web');
const Api = require('./api');

const web = new Web();
const api = new Api();


// 定义全局变量
const userData = app.getPath("userData");
const cookie = path.join(userData, "cookie");


function createMainWindow() {
    const window = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    window.loadURL(`http://127.0.0.1:${web.getPort()}`);
}

app.whenReady().then(async () => {
    try {
        await web.start();  // 启动 Web 服务器
        await api.start();  // 启动 API 服务
        web.setApiServerPort(api.getPort());
        // 创建主窗口
        createMainWindow();
    } catch (error) {
        log.error('应用启动失败:', error);
        app.quit();
    }
});

app.on("window-all-closed", async () => {
    await web.close();  // 关闭 Web 服务器
    await api.close();
    app.quit();
});
