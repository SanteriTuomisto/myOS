# myOS roadmap

Everything we want to do with myOS: ideas, todos and known bugs. Check items off as they land, and add new ones anywhere.

## Next up

- [x] **App registry**: one central list of apps (component, icon, name, window size) instead of hardcoded if/else chains in Desktop, StartMenu and FileExplorer. Everything below that adds an app or icon builds on this.
- [x] **External apps**: projects from other repos run as iframe windows, listed in the registry by URL (see `docs/external-apps.md`)
- [ ] **postMessage bridge** for external apps so apps can set their title, close their window, and read/write myOS files (sketch in `docs/external-apps.md`)

## Known bugs

- [x] Mobile: windows hang off a phone screen (fixed by mobile mode, see Tech debt).
- [x] Recycle Bin opens an empty window.
- [ ] Music player: songs go in `src/assets/music/`, which doesn't exist yet; a failed `audio.play()` isn't handled.
- [x] On reload, the last window to mount becomes active instead of the saved active window.
- [x] Focusing an input in a window that sticks out past the screen edge scrolled the whole desktop sideways.
- [ ] Browser URL bar keeps typed text after going back to the same page.
- [ ] Monster Slayer: attack/special/heal never roll their top value (e.g. 5–11 instead of 5–12), special attack is usable in round 1, heal caps at 100 instead of starting health, the shop and gear views are empty.
- [ ] Files: the text file icon is too big and overlaps the item name.
- [ ] Text editor: typed text is invisible, white on white.
- [ ] Mobile: more problems found on a real phone (details to come).

## Nice-to-have features

- [x] Nicer icons: no hardcoded if/else in Start menu, Desktop and File Explorer (covered by the app registry)
- [x] Protect certain folders and files from being deleted (e.g. Desktop, Start Menu, My Computer)
- [x] Clicking a taskbar item hides/shows the window, the same as the window's `_` button
- [ ] File Explorer: drag-and-drop item ordering
- [ ] Terminal: tab completion
- [ ] Terminal: missing basic commands like `cat`
- [ ] Browser: Boogle search doesn't actually search yet
- [ ] Browser: bookmarks bar with all the available websites, so they're easier to find
- [x] File Explorer: rename items
- [x] Naming items and folders when they're created
- [x] Recycle bin: deleted items go there, with "restore one", "restore all" and "empty bin"

## New apps

### From my other repos (iframe apps)
- [x] Analog synth simulator (synth repo): https://santerituomisto.github.io/synth/
- [x] 3D excavator (3d-machine-viewer repo), also the three.js / Blender demo: https://santerituomisto.github.io/3d-machine-viewer/
- [ ] Drum machine (new repo, deployed like the synth)
- [ ] **DAW**: record songs with the synth and the drum machine. Leaning towards the DAW loading both instruments itself (one audio clock, easy recording) rather than separate apps talking over the postMessage bridge; to be decided when we get there.

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
  - Fun fact: myOS can already be opened inside its own browser (www.myos.com) :D
- [ ] **Virus + antivirus**: browsing dodgy pages in the myOS browser can give you a virus that spams funny popups; an antivirus app cleans it up
- [ ] **Messenger**: nostalgic Windows Messenger-style chat

## Tech debt

- [x] Move from Vuex to Pinia
- [x] Convert all components to `<script setup lang="ts">`
- [x] Tests for every store and component (Vitest + Vue Test Utils)
- [ ] End-to-end tests for the main flows (Playwright)
- [x] **Mobile mode** below 768px wide: every window full screen, no drag/resize/maximize, taskbar as the app switcher, single tap opens desktop icons (in Files: tap selects, tap again opens), bigger title-bar buttons. Display only, so a wide screen gets the saved windows back. Still to check on a real phone (only emulated so far).
- [x] **Automatic deploy of main**: merging to main deploys myOS to https://santerituomisto.github.io/myOS/ (`.github/workflows/deploy.yml`); the `SanteriTuomisto.github.io` repo only redirects the root there and fixes the case of mistyped app paths.

## Done

- [x] Switch to pnpm + Vite, update all packages, remove PrimeVue (2026-10)
- [x] Folders on the desktop/start menu open in File Explorer
- [x] Each browser window has its own history
- [x] Mobile: no page scroll, taskbar always visible
- [x] Fixes: version reset of saved state, duplicate file ids, delete removing the wrong item, terminal crashes, desktop text files opening empty
