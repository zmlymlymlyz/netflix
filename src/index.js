const { app, BrowserWindow, Notification } = require('./Electron')
const { Client } = require('./RPC')
const widevine = require('electron-widevinecdm')
const path = require('path')

widevine.load(app)

app.setAppUserModelId('com.netflix.nirewen')

let mainWindow
const rpc = new Client({
    transport: 'ipc',
    clientId: '387083698358714368'
})

rpc.on('ready', () => {
    mainWindow.checkNetflix()

    setInterval(mainWindow.checkNetflix.bind(mainWindow), 15E3)
})

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        rpc,
        title: 'Netflix',
        icon: path.join(__dirname, '../assets/icon.ico')
    })
    mainWindow.maximize()
    mainWindow.loadURL('https://www.netflix.com/browse')

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
            icon: path.join(__dirname, '../assets/icon.ico')
        })

        notification.show()

        notification.on('click', () => app.emit('rpc'))
    })
})
