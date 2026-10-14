export type AppType =
  | 'file'
  | 'fileExplorer'
  | 'browser'
  | 'recycleBin'
  | 'musicPlayer'
  | 'terminal'
  | 'settings'
  | 'monsterSlayer';

export type ItemType = AppType | 'folder';

export interface FileSystemItem {
  id: number;
  type: ItemType;
  name: string;
  content?: FileSystemItem[];
}

/** A step in a folder path. The root ("home") has id -1. */
export interface PathItem {
  id: number;
  name: string;
}

export interface Position {
  top: number | string;
  left: number | string;
}

export interface Size {
  width: number;
  height: number;
}

export interface Application {
  id: number;
  name: string;
  type: AppType;
  fileSystemId?: number;
  position?: Position;
  size?: Size;
  minimized: boolean;
  maximized: boolean;
}

export interface OpenApplicationInput {
  name: string;
  type: AppType;
  fileSystemId?: number;
}
