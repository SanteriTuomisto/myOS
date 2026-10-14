# myOS roadmap

Everything we want to do with myOS: ideas, todos and known bugs. Check items off as they land, and add new ones anywhere.

## Next up

- [ ] **App registry**: one central list of apps (component, icon, name, window size) instead of hardcoded if/else chains in Desktop, StartMenu and FileExplorer. Everything below that adds an app or icon builds on this.
- [ ] **External apps**: projects from other repos run as iframe windows, listed in the registry by URL. Later: a postMessage bridge so apps can set their title, close their window, and read/write myOS files.

## Known bugs

- [ ] Mobile: windows opened at desktop size hang off a phone screen. They need a mobile layout, e.g. always maximized.
- [ ] Recycle Bin opens an empty window.

## Nice-to-have features

- [ ] Nicer icons: no hardcoded if/else in Start menu, Desktop and File Explorer (covered by the app registry)
- [ ] Protect certain folders and files from being deleted (e.g. Desktop, Start Menu, My Computer)
- [ ] Clicking a taskbar item hides/shows the window, the same as the window's `_` button
- [ ] File Explorer: drag-and-drop item ordering
- [ ] File Explorer: rename items (the Rename button exists but does nothing yet)
- [ ] Naming items and folders when they're created
- [ ] Recycle bin: deleted items go there, with "restore one" and "restore all"

## New apps

### From my other repos (iframe apps)
- [ ] Analog synth simulator (synth repo)
- [ ] 3D excavator (3d-machine-viewer repo), also the three.js / Blender demo

### Built into myOS
- [ ] **Task manager / Ctrl+Alt+Del**: fake CPU, GPU, network and memory graphs, a list of running apps, and closing them from there
- [ ] **Settings**
  - [ ] OS themes. First one: dark, cyberpunk, Blade Runner, super futuristic
  - [ ] User-made custom themes; make the OS highly customizable (colors, fonts, borders, wallpaper)
  - [ ] User settings and profile picture
- [ ] **Music player**
  - [ ] Play my own music from SoundCloud, so this works as a player for music I make (SoundCloud's embed/widget API)
  - [ ] Old Windows Media Player-style visualizations in the background
  - [ ] Synthwave grid visual, like https://codepen.io/inegoita/pen/BgdXMw
- [ ] **Funny camera**: face recognition / camera app that makes you look funny (`getUserMedia` + a face-landmark model)
- [ ] **Virtual machine**: open a new machine inside myOS (myOS in myOS in myOS), or Linux (e.g. the v86 emulator)
- [ ] **Virus + antivirus**: browsing dodgy pages in the myOS browser can give you a virus that spams funny popups; an antivirus app cleans it up
- [ ] **Messenger**: nostalgic Windows Messenger-style chat

## Tech debt

- [ ] Move from Vuex (maintenance mode) to Pinia
- [ ] Convert remaining plain-JS components to TypeScript
- [ ] Code that only works on desktop: windows, drag and resize need touch/mobile handling

## Done

- [x] Switch to pnpm + Vite, update all packages, remove PrimeVue (2026-10)
- [x] Folders on the desktop/start menu open in File Explorer
- [x] Each browser window has its own history
- [x] Mobile: no page scroll, taskbar always visible
- [x] Fixes: version reset of saved state, duplicate file ids, delete removing the wrong item, terminal crashes, desktop text files opening empty
