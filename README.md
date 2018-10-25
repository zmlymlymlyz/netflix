# discord-netflix
A Netflix wrapper that uses Discord RPC to show what you're watching using the new Rich Presence

# Prebuilt installers
You can download a prebuilt installer from [releases](https://github.com/nirewen/discord-netflix/releases) if you want.

# Building yourself

## Prepairing the environment
You will need: <br>
- [Node.js](http://nodejs.org/en/download) (Version > 7.0.0)<br>
- [Git](https://git-scm.com/downloads)

Make sure you add both to the PATH.

## Running
You have to install the dependencies. So, just run `npm install` in the repo's folder.<br>
Once it's done, run `npm start` to start the application.

## Build and distribution
The app also have a build method, used for distribution. It will generate a NSIS installer for the app, and a packaged version of it.<br>
To build the app for distribution, run `npm run dist`.

# Contributing
If you have a suggestion, an implementation, a fix, you can fork this repo and make all the changes you want.<br>
Then, when you're finished, you can open a pull request here.

## Contributors
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

* [Nirewen#9011](http://github.com/nirewen)
* [Keyygan#0001](https://github.com/keyygan)
* [Dmfj#0001](https://github.com/dmfj)
* [Wistful__#9063](https://hexaplexsoftware.ga/wist/)
* [NovusTheory#2244](https://github.com/NovusTheory)

# Errors
If Discord is not opened, or, for some reason, the RPC Client couldn't connect to it, an error will show in the app. It disappears in 15 seconds.<br>
Even if Discord is not opened, you can still use the app as a normal Netflix wrapper.

# Things you should know
The app has support for most of the avatars available in Netflix, and shows in the Rich Presence (see previews).

# Planned
Netflix Party support so you and your friends can watch anything together (and show in the Rich Presence, obviously)

# Previews

Idle: <br>
![Browsing](https://nirewen.s-ul.eu/i7XVpo6t.png)


Watching a Show: <br> 
![Watching](https://img.hexaplexsoftware.ga/saved/VRBYhv2q.png) 

Watching a Movie: <br>
![Watching](https://img.hexaplexsoftware.ga/saved/r2vii1T7.png)


# Tutorials

`PT-BR`<br>
[![](https://i.ytimg.com/vi/8AYBykvOKzo/0.jpg)](https://www.youtube.com/watch?v=8AYBykvOKzo)<br>
Credits: Maicon Alves (Maik`#8097`)
