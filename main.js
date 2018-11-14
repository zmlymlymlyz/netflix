const {BrowserWindow, app} = require('electron');
const {Client}             = require('discord-rpc');
const widevine             = require('electron-widevinecdm');
const moment               = require('moment');
const crypto               = require('crypto');
const rpc                  = new Client({transport: 'ipc'});

widevine.load(app);

let clientId = '387083698358714368',
    mainWindow,
    smallImageKey,
    smallImageText,
    WindowSettings = {
        backgroundColor: '#FFF',
        useContentSize: false,
        autoHideMenuBar: true,
        resizable: true,
        center: true,
        frame: true,
        alwaysOnTop: false,
        title: 'Netflix',
        icon: __dirname + '/icon.ico',
        webPreferences: {
            nodeIntegration: false,
            plugins: true,
        },
    },
    current = {},
    login = (tries = 0) => {
        if (tries > 10) return mainWindow.webContents.executeJavaScript(connectionNotice);
        tries += 1;
        rpc.login({clientId}).catch(e => setTimeout(() => login(tries), 10E3));
    },
    getInfos = `(function() {
        let [type, id] = window.location.pathname.split('/').slice(1, 3);
        if (type == 'browse' && type != 'watch') {
            var rawAvatar = "";

            // Sanity check to make sure the netflix API is loaded
            if (window.netflix !== null) {
                var currentProfileGuid = window.netflix.reactContext.models.userInfo.data.userGuid;
                rawAvatar = window.netflix.falcorCache.profiles[currentProfileGuid].avatar.value[2];
            }

            return {
                name   : 'Browsing',
                episode: 'In the Catalogs',
                avatar : rawAvatar,
            }
        }
        if (type == 'watch' && document.querySelector(".ellipsize-text")) {
            let name = document.querySelector('.ellipsize-text'),
                span = document.querySelector('.ellipsize-text').querySelectorAll('span'),
                video = document.querySelector('.VideoContainer').getElementsByTagName('video')[0];
            return {
                name             : name.querySelector('h4') ? name.querySelector('h4').innerHTML : name.innerHTML,
                title            : span.length > 1 ? span[1].innerHTML : undefined,
                episode          : span.length ? span[0].innerHTML : undefined,
                videoDuration    : video.duration,
                videoCurrentTime : video.currentTime,
                videoPaused      : video.paused,
            }
        }
    })()`,
    connectionNotice = `let notice = document.createElement('div'),
        close_btn = document.createElement('span');
        notice.className = 'error-notice';
        notice.setAttribute('style', 'position: fixed; top: 0px; background: #ef5858; border-bottom: 3px solid #e61616; border-radius: 3px; z-index: 101; color: white; width: 99%; line-height: 2em; text-align: center; margin: 0.5%;');
        close_btn.className = 'close-btn';
        close_btn.innerHTML = '&times;';
        close_btn.setAttribute('style', 'float: right; margin-right: 0.5%; font-size: 20px;');
        notice.innerHTML = 'Failed to connect to Discord IRC. Connection timed out.';
        notice.appendChild(close_btn);
        document.body.appendChild(notice);
        notice.onclick = () => document.body.removeChild(notice);
        setTimeout(() => document.body.removeChild(notice), 15E3);`;
 
async function checkNetflix() {
    if (!rpc || !mainWindow) return;
    
    let infos = await mainWindow.webContents.executeJavaScript(getInfos);
    
    if (infos) { // if !infos don't change presence then.
        let {name, title, episode, avatar, videoDuration, videoCurrentTime, videoPaused} = infos,
            video = episode && title
                ? `${episode} - ${title}` 
                : episode,
            curr = parseInt(new Date().getTime().toString().slice(0, 10)),
            endTimestamp;

        // Evaluate the avatar id from the avatar (RegExp was acting funny inside the executeJavaScript for some reason, same code worked if copy and pasted into inspect element console and here)
        var avatarRegex = /AVATAR\|(.*)\|.*\|.*\|.*/gm;
        var match = avatarRegex.exec(avatar);
        if (match !== null) {
            // MD5 hash is required as the length is too long (32 characters is the max)
            avatar = crypto.createHash('md5').update(match[1]).digest('hex');
        }

        if (avatar) smallImageKey = avatar;
        // if the avatar doesn't show in the Rich Presence, it means it's not supported

        smallImageText = "Idle";
        if (videoDuration && videoCurrentTime) {
            if (!videoPaused) {
                let now = moment.utc(),
                    remaining = moment.duration(videoDuration - videoCurrentTime, 'seconds');
                
                smallImageText = "Playing";
                endTimestamp = now.add(remaining).unix();
            } else 
                smallImageText = "Paused";
        }
            
        // set activity less often | only update if something has changed
        if (current.avatar !== avatar || current.video !== video || current.videoPaused !== videoPaused) {
            current = {avatar, video, videoPaused};
            
            rpc.setActivity({
                details: name,
                state: video,
                largeImageKey: 'netflix',
                largeImageText: 'Netflix',
                smallImageKey,
                smallImageText,
                instance: false,
                endTimestamp,
            });
        }
    }
}

rpc.on('ready', () => {
    checkNetflix();
    setInterval(() => {
        checkNetflix();
    }, 15E3);
});

app.on('ready', () => {
    mainWindow = new BrowserWindow(WindowSettings);
    mainWindow.maximize();
    mainWindow.loadURL("https://www.netflix.com/");
    login();
});

app.on('window-all-closed', () => {
    app.quit();
});
