# myOS roadmap

Everything we want to do with myOS: ideas, todos and known bugs. Check items off as they land, and add new ones anywhere.

## Next up

- [ ] **App registry**: one central list of apps (component, icon, name, window size) instead of hardcoded if/else chains in Desktop, StartMenu and FileExplorer. Everything below that adds an app or icon builds on this.
- [ ] **External apps**: projects from other repos run as iframe windows, listed in the registry by URL. Later: a postMessage bridge so apps can set their title, close their window, and read/write myOS files.

## Known bugs

- [ ] Mobile: windows opened at desktop size hang off a phone screen. They need a mobile layout, e.g. always maximized.
- [ ] Recycle Bin opens an empty window.
- [ ] Music player: songs go in `src/assets/music/`, which doesn't exist yet; a failed `audio.play()` isn't handled.
- [ ] On reload, the last window to mount becomes active instead of the saved active window.
- [ ] Browser URL bar keeps typed text after going back to the same page.
- [ ] Monster Slayer: attack/special/heal never roll their top value (e.g. 5–11 instead of 5–12), special attack is usable in round 1, heal caps at 100 instead of starting health, the shop and gear views are empty.

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

- [x] Move from Vuex to Pinia
- [x] Convert all components to `<script setup lang="ts">`
- [x] Tests for every store and component (Vitest + Vue Test Utils)
- [ ] End-to-end tests for the main flows (Playwright)
- [ ] Code that only works on desktop: windows, drag and resize need touch/mobile handling
- [ ] **Automatic deploy of main.** Today https://santerituomisto.github.io/ is served by GitHub Pages ("deploy from a branch") from the `master` branch root of the separate `SanteriTuomisto/SanteriTuomisto.github.io` repo. Deploying means building myOS by hand and committing the build output there; the last deploy (2024-01, "1.0.0") is still the old Vue CLI build, so the live site is behind this repo. Options:
  - **Push the build to the Pages repo from CI**: a deploy job in `.github/workflows/ci.yml` that runs on pushes to main after the checks pass, then commits `dist/` to `SanteriTuomisto.github.io` `master` (e.g. `peaceiris/actions-gh-pages` with `external_repository`). Needs a deploy key or fine-grained token with write access to that repo, stored as a secret here. Keeps the URL and the Pages repo as-is.
  - **Move Pages into this repo**: rename this repo to `SanteriTuomisto.github.io` (or make the old one redirect) and switch Pages to "GitHub Actions" as the source, then deploy with `actions/upload-pages-artifact` + `actions/deploy-pages`. No cross-repo secret, but the old repo's history and settings get retired.
  - Either way `base` stays `/` in `vite.config.ts`, since a user site is served from the domain root. Add `.nojekyll` (or deploy via the Actions source) so Pages doesn't run Jekyll on the output.

## Done

- [x] Switch to pnpm + Vite, update all packages, remove PrimeVue (2026-10)
- [x] Folders on the desktop/start menu open in File Explorer
- [x] Each browser window has its own history
- [x] Mobile: no page scroll, taskbar always visible
- [x] Fixes: version reset of saved state, duplicate file ids, delete removing the wrong item, terminal crashes, desktop text files opening empty
