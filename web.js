const express = require('express');
const path = require('path');
const log = require('electron-log');

// Web 类封装
class Web {

    constructor() {
        if (Web.instance) {
            return Web.instance;
        }
        this.webDist = path.join(__dirname, "FE", "dist");
        this.webIndex = path.join(this.webDist, "index.html");
        this.webServer = null;
        this.webServerPort = 0;
        this.apiServerPort = 0;
        Web.instance = this;
    }

    // 启动 Web 服务器
    async start() {
        await this.close();
        const app = express();
        app.use(express.static(this.webDist));
        app.all("/api/port", (req, res) => {
            res.send(this.getApiServerPort());
        });
        app.all('*', (req, res) => {
            res.sendFile(this.webIndex);
        });
        return new Promise((resolve, reject) => {
            this.webServer = app.listen(this.webServerPort, '0.0.0.0', (err) => {
                if (err) {
                    reject(err);
                }
                this.webServerPort = this.webServer.address().port;
                log.info(`Web server started on port ${this.webServerPort}`);
                resolve();
            });
        });
    }

    // 关闭 Web 服务器
    async close() {
        if (this.webServer) {
            await new Promise((resolve, reject) => {
                this.webServer.close((err) => {
                    log.info(`Web server exited`);
                    resolve();
                });
            });
            this.webServer = null;
        }
    }

    // 获取 Web 服务器端口
    getPort() {
        return this.webServerPort;
    }

    // 设置 API 服务器端口
    setApiServerPort(port) {
        this.apiServerPort = port;
    }

    // 获取 API 服务器端口
    getApiServerPort() {
        return this.apiServerPort;
    }

}

module.exports = Web;
