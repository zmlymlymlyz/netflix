module.exports = {
    infos: function () {
        let [type, id] = location.pathname.split('/').slice(1, 3)
        let avatar = ''
        let userName

        if (netflix) {
            let { userGuid, name } = netflix.reactContext.models.userInfo.data
            avatar = netflix.falcorCache.profiles[userGuid].avatar.value[2]
            userName = name
        }

        if (type == 'browse') {
            return {
                name   : 'Browsing',
                episode: 'In the Catalogs',
                avatar,
                userName
            }
        }
        if (type == 'watch' && document.querySelector(".ellipsize-text")) {
            let name = document.querySelector('.ellipsize-text')
            let span = document.querySelector('.ellipsize-text').querySelectorAll('span')
            let { duration, currentTime, paused } = document.querySelector('.VideoContainer').getElementsByTagName('video')[0]

            return {
                name    : name.querySelector('h4').innerHTML || name.innerHTML,
                title   : span[1] ? span[1].innerHTML : undefined,
                episode : span[0] ? span[0].innerHTML : undefined,
                duration, 
                currentTime, 
                paused,
                avatar,
                userName
            }
        }
    }
}
