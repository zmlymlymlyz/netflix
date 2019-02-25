const { app, BrowserWindow, Notification } = require('./Electron')
const { Client } = require('./RPC')
const { NetflixParty } = require('./NetflixParty')
const scripts = require('./util/scripts')
const widevine = require('electron-widevinecdm')
const path = require('path')
const discordRegister = require('electron-discord-register')

widevine.load(app)

app.setAppUserModelId('com.netflix.nirewen')

const icon = path.join(__dirname, '../assets/icon.png')
const discordAppId = '387083698358714368'

// Register the application with Discord for join requests
discordRegister(discordAppId)

let mainWindow
const rpc = new Client({
    transport: 'ipc',
    clientId: '387083698358714368'
})
const party = new NetflixParty();

rpc.on('ready', () => {
    mainWindow.checkNetflix()

    setInterval(mainWindow.checkNetflix.bind(mainWindow), 15E3)
})

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        rpc,
        title: 'Netflix',
        icon,
        party,
    })
    mainWindow.maximize()
    mainWindow.loadURL('https://www.netflix.com/browse')

    party.ipcSetup(mainWindow);
    mainWindow.webContents.on('did-navigate-in-page', (e, url) => {
        // This is a bit ugly but it works
        let type = url.split('/').slice(1, 4)[2]

        if (type === 'watch') {
            // They're watching something so let's setup NetflixParty
            mainWindow.webContents.send('np', {
                type: 'createButton',
            });
        }
    });

    app.emit('rpc')
})

app.on('window-all-closed', () => {
    app.quit()
})

app.on('rpc', () => {
    rpc.start().catch(e => {
        let notification = new Notification({
            title: 'Could not connect to Discord',
            body: 'Click here to try again',
            icon
        })

        notification.show()

        notification.on('click', () => app.emit('rpc'))
    })
})
