const { ipcMain } = require('electron')

module.exports = class NetflixParty {
    constructor () {
        this.sessionData = {
            id: null
        }
    }

    ipcSetup (mainWindow) {
        ipcMain.on('np', (sender, data) => {
            console.log(data);
            // This is just loopback so the renderer can request a specific action be called
            if (data.type == "loopbackCall") {
                mainWindow.webContents.send('np', {
                    type: data.call,
                    data: data.data
                });
            }

            // This is a response for an action taken (like a promise return but only async)
            if (data.type == "response") {
                if (data.response == "createSession") {
                    this.sessionData.id = data.sessionId
                } else if (data.response == "leaveSession") {
                    this.sessionData.id = null
                }
            }
        });
    }
}
