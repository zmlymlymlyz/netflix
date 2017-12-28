const {BrowserWindow, app} = require('electron');
const {Client} = require('discord-rpc');
const widevine = require('electron-widevinecdm');
const rpc      = new Client({transport: 'ipc'});

widevine.load(app);

let appID = '387083698358714368',
    mainWindow,
    smallImageKey,
    smallImageText,
    WindowSettings = {
        backgroundColor: '#000',
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
    login = (tries = 0) => {
        if (tries > 10) return mainWindow.webContents.executeJavaScript(connectionNotice);
        tries += 1;
        rpc.login(appID).catch(e => setTimeout(() => login(tries), 10E3));
    },
    getInfos = `(function() {
        let [type, id] = window.location.pathname.split('/').slice(1, 3);
        if (type == 'browse') {
            return {
                name: 'Browsing',
                title: 'In the Catalog',
                avatar: document.querySelector('img.profile-icon') 
                    ? document.querySelector('img.profile-icon').getAttribute('src').split('/').pop().split('.')[0].toLowerCase()
                    : undefined,
                username: document.querySelector('.profile-link .profile-name')
                    ? document.querySelector('.profile-link .profile-name').innerHTML
                    : undefined,
            }
        }
        if (type == 'watch' && document.querySelector(".player-status-main-title")) {
            let show = document.querySelector('.player-status').getElementsByTagName('span');
            return {
                name   : document.querySelector(".player-status-main-title").innerHTML,
                title  : show[2].innerHTML,
                episode: show[1].innerHTML.split(/:? /)[3].padStart(2, '0'),
                season : show[1].innerHTML.split(/:? /)[1].padStart(2, '0'),
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
        let {name, title, episode, season, avatar, username} = infos,
            video = episode && season 
                ? `S${season}E${episode} - ${title}` 
                : title,
            show = {name, video,};
        
        if (avatar) smallImageKey = avatar;
        if (username) smallImageText = username;
        
        rpc.setActivity({
            details: name,
            state: video,
            largeImageKey: 'netflix',
            smallImageKey,
            smallImageText,
            instance: false,
        });
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
    mainWindow.loadURL("http://www.netflix.com/");
    login();
});

app.on('window-all-closed', app.quit);
app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
});