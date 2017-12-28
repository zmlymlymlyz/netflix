# discord-netflix
A Netflix wrapper that uses Discord RPC to show what you're watching using the new Rich Presence

# Running
You have to install the dependencies. So, just run `npm install` in the repo's folder.
Once it's done, run `npm start` to start the application.

# Building
The app also have a build method, used for distribution. It will generate a NSIS installer for the app, and a packaged version of it.
To build the app for distribution, run `npm run dist`.

# Errors
If Discord is not opened, or, for some reason, the RPC Client couldn't connect to it, an error will show in the app. It disappears in 15 seconds.
Even if Discord is not opened, you can still use the app as a normal Netflix wrapper.

# Things you should know
The app has support for all the 28 avatars available in Netflix, and shows in the Rich Presence (see previews). It also shows the name of the logged account when you hover the small image. So if you don't want it to show your name, you can edit main.js, lines 41-43.

# Planned
Netflix Party support so you and your friends can watch anything together (and show in the Rich Presence, obviously)

# Previews
![Browsing](https://nirewen.s-ul.eu/i7XVpo6t.png)

![Watching](https://nirewen.s-ul.eu/1p7pev5D.png) 