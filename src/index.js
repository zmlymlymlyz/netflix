const { app, BrowserWindow, Notification } = require('./Electron')
const { Client } = require('./RPC')
const moment = require('moment')
const crypto = require('crypto')
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
    checkNetflix()

    setInterval(checkNetflix, 15E3)
})

app.on('ready', () => {
    mainWindow = new BrowserWindow({
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
            icon: path.join(__dirname, '../assets/icon.ico'),
            requireInteraction: true
        })

        notification.show()

        notification.on('click', () => app.emit('rpc'))
    })
})

async function checkNetflix () {
    if (!rpc || !mainWindow) 
        return
    
    let infos = await mainWindow.getInfos()
    
    if (infos) { // if !infos don't change presence then.
        let { name, title, episode, duration, currentTime, paused, avatar, userName } = infos
        let video = episode && title
            ? `${episode} - ${title}` 
            : episode
        let endTimestamp

        // Evaluate the avatar id from the avatar (RegExp was acting funny inside the executeJavaScript for some reason, same code worked if copy and pasted into inspect element console and here)
        let avatarRegex = /AVATAR\|(.*)\|.*\|.*\|.*/gm
        let match = avatarRegex.exec(avatar)

        if (match)
            avatar = crypto
                .createHash('md5')
                .update(match[1])
                .digest('hex')

        // if the avatar doesn't show in the Rich Presence, it means it's not supported
        if (avatar) 
            smallImageKey = avatar

        if (userName)
            smallImageText = userName

        if (duration && currentTime) {
            if (!paused) {
                let now = moment.utc()
                let remaining = moment.duration(duration - currentTime, 'seconds')
                
                endTimestamp = now.add(remaining).unix()
            }
        }
            
        // set activity less often | only update if something has changed
        if (rpc.currentState.avatar !== avatar || rpc.currentState.video !== video || rpc.currentState.videoPaused !== paused) {
            rpc.currentState = { avatar, video, paused }
            
            rpc.setActivity({
                details: name,
                state: video,
                largeImageKey: 'netflix',
                largeImageText: 'Netflix',
                smallImageKey,
                smallImageText,
                instance: false,
                endTimestamp,
            })
        }
    }
}