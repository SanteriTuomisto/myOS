# External apps

myOS is the hub for projects that live in their own repos (the analog synth, the 3D excavator, ...).
Each project is deployed on its own, and myOS shows it in a window as an `<iframe>`.
The project needs no myOS code to work; the [bridge](#postmessage-bridge-sketch) below is optional and not built yet.

## How apps are defined

Every app, built-in or external, is one entry in [`src/apps/registry.ts`](../src/apps/registry.ts).
The entry's key is the **app id**. Files on the desktop, in the start menu and in folders store only that id
(`{ id: 23, type: 'synth', name: 'Synth' }`), and so do open windows. The registry itself is code, not saved state,
so changes to an app (its URL, icon, sizes) reach returning visitors without wiping their saved files.

Never rename an app id: saved items that point to the old id stop opening (they're skipped, not crashed on).

## Adding a project as an app

1. **Deploy the project** somewhere with HTTPS, e.g. GitHub Pages from its own repo.
   - Build it with a relative or repo-scoped base path (Vite: `base: './'` or `base: '/synth/'`), so assets load under the subpath.
   - Don't send `X-Frame-Options: DENY`/`SAMEORIGIN` or a `Content-Security-Policy: frame-ancestors` that leaves out the myOS origin. GitHub Pages sends neither.
   - It should fill the viewport (`html, body { height: 100%; margin: 0 }`) and handle being resized, since the window can be any size down to its `minSize`.
2. **Add an icon** to `src/assets/` as a Vue SVG component using `currentColor` (see `SynthIcon.vue`).
3. **Add a registry entry** in `src/apps/registry.ts`: add the id to the `AppType` union, then the entry
   to `apps` (TypeScript complains until both match):

   ```ts
   synth: {
     kind: 'external',
     name: 'Synth',
     icon: SynthIcon,
     url: 'https://santerituomisto.github.io/synth/',
     defaultSize: { width: 800, height: 500 },
     minSize: { width: 400, height: 250 },
   },
   ```

4. **Put it on the desktop / in the start menu** by adding items to `defaultItems` in `src/stores/fileSystem.ts`
   (new unique ids, then raise `nextFileId` past them).
5. **Bump the version in `package.json`.** Saved state resets when the version changes, which is what puts
   the new default items in front of returning visitors.

Adding a built-in app is the same, with `kind: 'builtIn'` and a `component` (plus `props` if it needs the
open application's ids) instead of `url`.

## What the iframe allows

`ExternalApp.vue` renders:

```html
<iframe src="..." allow="autoplay; fullscreen" allowfullscreen>
```

- **Web Audio** works. The `autoplay` permission lets a project start sound without the browser's
  "click first" block once the user has interacted with it.
- **WebGL** needs no permission and works in any iframe.
- **Fullscreen** works through the Fullscreen API (`element.requestFullscreen()`).
- There's no `sandbox` attribute: the projects are our own, and a sandbox would need `allow-scripts allow-same-origin`
  anyway. Add one per app if a third-party URL ever goes in the registry.
- Other features (`midi`, `gamepad`, `camera`, `microphone`, `clipboard-write`) must be added to `allow` first,
  e.g. Web MIDI for the synth. If that's needed, make `allow` a registry field.

While a window is inactive, dragged or resized, the iframe gets `pointer-events: none`. Otherwise it would swallow
the mouse events: drags would stop when the cursor crosses the iframe, and clicking an inactive window wouldn't
bring it to front. The first click on an inactive external app therefore only activates the window.

## postMessage bridge (sketch)

Not built yet. The idea: a project can talk to myOS with `window.parent.postMessage`, so it can feel native
while still running fine on its own.

### Messages

From the app to myOS (`source: 'myos-app'`):

| `type`        | Payload                         | Effect                                       |
| ------------- | ------------------------------- | -------------------------------------------- |
| `ready`       |                                 | Handshake; myOS answers with `hello`         |
| `setTitle`    | `{ title: string }`             | Sets the window title (`Application.name`)   |
| `close`       |                                 | Closes the window                            |
| `readFile`    | `{ requestId, path: string }`   | Reads a myOS text file, answered by `result` |
| `writeFile`   | `{ requestId, path, text }`     | Creates or overwrites a myOS text file       |
| `listFolder`  | `{ requestId, path: string }`   | Lists a folder's items                       |

From myOS to the app (`source: 'myos'`):

| `type`    | Payload                                        |
| --------- | ---------------------------------------------- |
| `hello`   | `{ version, windowId, theme? }`                |
| `result`  | `{ requestId, ok: boolean, data?, error? }`    |
| `focus` / `blur` | When the window becomes active/inactive (e.g. to pause audio) |

Paths are like `/My Computer/Documents/patch.txt`, resolved with `fileSystem.findFolderPath` and friends.

### Shape on the myOS side

```ts
// src/apps/bridge.ts
window.addEventListener('message', (event) => {
  // Find the window by its iframe, never trust ids in the message
  const app = openExternalApps.find((a) => a.iframe.contentWindow === event.source);
  if (!app || event.origin !== new URL(app.definition.url).origin) return;
  if (event.data?.source !== 'myos-app') return;
  handlers[event.data.type]?.(app, event.data);
});
```

### Rules

- **Check `event.origin`** against the registry URL's origin, and match `event.source` to the window's iframe.
  Ignore everything else.
- **Reply with an explicit target origin** (`iframe.contentWindow.postMessage(msg, origin)`), never `'*'`.
- **Scope file access.** Start with read/write inside a per-app folder (e.g. `/My Computer/Apps/Synth/`);
  wider access could be a registry flag (`permissions: ['files']`) that the user is asked about once.
- **Version the protocol** in `hello`, so old deployments of a project keep working.
- A tiny `myos-bridge` helper (a few lines, copied or published) lets a project detect it runs in myOS
  (`window.parent !== window`) and fall back to normal behavior when standalone.
