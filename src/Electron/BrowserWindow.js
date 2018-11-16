const Electron = require('electron')
const scripts = require('../util/scripts')
const moment = require('moment')
const crypto = require('crypto')

module.exports = class BrowserWindow extends Electron.BrowserWindow {
    constructor ({ title, icon, rpc }) {
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

        this.rpc = rpc
    }

    eval (code) {
        return this.webContents.executeJavaScript(code)
    }

    getInfos () {
        return this.eval(`(${scripts.infos})()`)
    }
    
    async checkNetflix () {
        let infos = await this.getInfos()
        
        if (infos) { // if !infos don't change presence then.
            let { name, title, episode, duration, currentTime, paused, avatar, userName } = infos
            let video = episode && title
                ? `${episode} - ${title}` 
                : episode
            let endTimestamp
            let smallImageKey
            let smallImageText
    
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
            if (this.rpc.currentState.avatar !== avatar || this.rpc.currentState.video !== video || this.rpc.currentState.videoPaused !== paused) {
                this.rpc.currentState = { avatar, video, paused }
                
                this.rpc.setActivity({
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
}