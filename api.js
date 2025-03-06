const {execFile} = require('child_process');
const log = require('electron-log');
const path = require('path');

// 定义 API 服务器类
class Api {

    constructor() {
        if (Api.instance) {
            return Api.instance;
        }
        this.apiServer = null;
        this.apiServerPort = 0;
        this.apiDist = path.join(__dirname, "BE", "dist");
        this.apiAppBin = path.join(this.apiDist, "app.bin");
        Api.instance = this;
    }

    // 启动 API 服务
    async start() {
        await this.close();
        return new Promise((resolve, reject) => {
            const onData = (data) => {
                const output = data.toString();
                const match = output.match(/^Server\sis\srunning\son:.*:(\d+)\s*$/);
                if (match) {
                    this.apiServerPort = match[1];
                    log.info(`Api server started on port ${this.apiServerPort}`);
                    this.apiServer.stdout.off("data", onData);
                    resolve();
                }
            };
            this.apiServer = execFile(this.apiAppBin, [], (err, stdout, stderr) => {
                if (err || stderr) {
                    reject(new Error(`Failed to start apiServer: ${stderr || err.message}`));
                }
            });
            this.apiServer.stdout.on("data", onData);
            this.apiServer.on("exit", (code, signal) => {
                if (code !== 0) {
                    reject(new Error(`Api server failed with exit code ${code} and signal ${signal}`));
                }
            });
        });
    }

    // 关闭 API 服务
    async close() {
        if (this.apiServer) {
            await new Promise((resolve, reject) => {
                this.apiServer.kill('SIGINT');
                this.apiServer.on('exit', (code, signal) => {
                    log.info(`Api server exited`);
                    resolve();
                });
            });
            this.apiServer = null;
        }
    }

    // 获取当前 API 服务端口
    getPort() {
        return this.apiServerPort;
    }

}

// 导出 Api 类
module.exports = Api;
