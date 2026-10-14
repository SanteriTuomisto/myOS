import { defineAsyncComponent, type Component } from 'vue';
import type { Application, Size } from '@/types';
import BrowserIcon from '@/assets/BrowserIcon.vue';
import ExcavatorIcon from '@/assets/ExcavatorIcon.vue';
import FileIcon from '@/assets/FileIcon.vue';
import FolderIcon from '@/assets/FolderIcon.vue';
import MonsterIcon from '@/assets/MonsterIcon.vue';
import MusicIcon from '@/assets/MusicIcon.vue';
import SettingsIcon from '@/assets/SettingsIcon.vue';
import SynthIcon from '@/assets/SynthIcon.vue';
import TerminalIcon from '@/assets/TerminalIcon.vue';
import TrashIcon from '@/assets/TrashIcon.vue';
import FileExplorer from '@/components/running/fileExplorer/FileExplorer.vue';
import Browser from '@/components/running/browser/Browser.vue';
import MusicPlayer from '@/components/running/musicPlayer/MusicPlayer.vue';
import TerminalWindow from '@/components/running/terminal/TerminalWindow.vue';
import SettingsWindow from '@/components/running/settings/SettingsWindow.vue';
import MonsterSlayer from '@/components/projects/monsterSlayer/MonsterSlayer.vue';
import RecycleBin from '@/components/running/recycleBin/RecycleBin.vue';

// Lazy so the editor library loads only when a file is opened
const TextEditor = defineAsyncComponent(() => import('@/components/running/editor/TextEditor.vue'));

interface BaseAppDefinition {
  /** Name for new desktop/start menu items and windows */
  name: string;
  icon: Component;
  /** Size of the first window; after that the last used size is remembered */
  defaultSize: Size;
  minSize: Size;
  /** For apps whose content draws its own top edge (toolbars, address bars) */
  hideBottomBorder?: boolean;
}

/** An app built into myOS, rendered by a Vue component. */
export interface BuiltInAppDefinition extends BaseAppDefinition {
  kind: 'builtIn';
  /** Window content; undefined for apps that don't do anything yet */
  component?: Component;
  /** Props for the component, from the open application */
  props?: (app: Application) => Record<string, unknown>;
}

/** A project deployed somewhere else, shown in an iframe. See docs/external-apps.md. */
export interface ExternalAppDefinition extends BaseAppDefinition {
  kind: 'external';
  url: string;
}

export type AppDefinition = BuiltInAppDefinition | ExternalAppDefinition;

const DEFAULT_SIZE: Size = { width: 500, height: 350 };
const MIN_SIZE: Size = { width: 400, height: 250 };

/**
 * Ids of every app myOS knows. Written out rather than derived from `apps`: components in
 * the registry use item types, which are built from this, and deriving it would be circular.
 * `apps` below must have exactly these keys.
 */
export type AppType =
  | 'file'
  | 'fileExplorer'
  | 'browser'
  | 'recycleBin'
  | 'musicPlayer'
  | 'terminal'
  | 'settings'
  | 'monsterSlayer'
  | 'synth'
  | 'excavator';

/**
 * Every app myOS knows. The key is the app id that file-system items and open windows store,
 * so never rename one: saved items pointing to it would stop opening.
 * This lives in code, not in persisted state, so new apps reach returning visitors.
 */
export const apps = {
  file: {
    kind: 'builtIn',
    name: 'Text',
    icon: FileIcon,
    component: TextEditor,
    props: (app) => ({ id: app.id, fileSystemId: app.fileSystemId }),
    defaultSize: { width: 700, height: 450 },
    minSize: { width: 659, height: 250 },
  },
  fileExplorer: {
    kind: 'builtIn',
    name: 'Files',
    icon: FolderIcon,
    component: FileExplorer,
    props: (app) => ({ fileSystemId: app.fileSystemId }),
    defaultSize: DEFAULT_SIZE,
    minSize: { width: 450, height: 350 },
    hideBottomBorder: true,
  },
  browser: {
    kind: 'builtIn',
    name: 'Browser',
    icon: BrowserIcon,
    component: Browser,
    defaultSize: DEFAULT_SIZE,
    minSize: MIN_SIZE,
    hideBottomBorder: true,
  },
  recycleBin: {
    kind: 'builtIn',
    name: 'Recycle Bin',
    icon: TrashIcon,
    component: RecycleBin,
    defaultSize: DEFAULT_SIZE,
    minSize: MIN_SIZE,
  },
  musicPlayer: {
    kind: 'builtIn',
    name: 'Music',
    icon: MusicIcon,
    component: MusicPlayer,
    defaultSize: DEFAULT_SIZE,
    minSize: MIN_SIZE,
  },
  terminal: {
    kind: 'builtIn',
    name: 'Terminal',
    icon: TerminalIcon,
    component: TerminalWindow,
    defaultSize: DEFAULT_SIZE,
    minSize: MIN_SIZE,
  },
  settings: {
    kind: 'builtIn',
    name: 'Settings',
    icon: SettingsIcon,
    component: SettingsWindow,
    defaultSize: DEFAULT_SIZE,
    minSize: MIN_SIZE,
  },
  monsterSlayer: {
    kind: 'builtIn',
    name: 'Monster Slayer',
    icon: MonsterIcon,
    component: MonsterSlayer,
    defaultSize: DEFAULT_SIZE,
    minSize: MIN_SIZE,
  },
  synth: {
    kind: 'external',
    name: 'Synth',
    icon: SynthIcon,
    url: 'https://santerituomisto.github.io/synth/',
    defaultSize: { width: 800, height: 500 },
    minSize: MIN_SIZE,
  },
  excavator: {
    kind: 'external',
    name: 'Excavator',
    icon: ExcavatorIcon,
    url: 'https://santerituomisto.github.io/3d-machine-viewer/',
    defaultSize: { width: 800, height: 600 },
    minSize: MIN_SIZE,
  },
} satisfies Record<AppType, AppDefinition>;

export const appTypes = Object.keys(apps) as AppType[];

/** The app for an id, or undefined for ids that no longer exist (e.g. in old saved state). */
export function getApp(type: string): AppDefinition | undefined {
  return Object.hasOwn(apps, type) ? apps[type as AppType] : undefined;
}

export function isAppType(type: string): type is AppType {
  return Object.hasOwn(apps, type);
}
