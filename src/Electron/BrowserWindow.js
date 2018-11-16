const Electron = require('electron')
const scripts = require('../util/scripts')

module.exports = class BrowserWindow extends Electron.BrowserWindow {
    constructor ({ title, icon }) {
        super({
            backgroundColor: '#FFF',
            useContentSize: false,
            autoHideMenuBar: true,
            resizable: true,
            center: true,
            frame: true,
            alwaysOnTop: false,
            title,
            icon,
            webPreferences: {
                nodeIntegration: false,
                plugins: true,
            },
        })
    }

    eval (code) {
        return this.webContents.executeJavaScript(code)
    }

    get infos () {
        return this.eval(`(${scripts.infos})()`)
    }
}