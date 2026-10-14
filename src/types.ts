import type { AppType } from '@/apps/registry';

// App ids come from the app registry
export type { AppType };

export type ItemType = AppType | 'folder';

export interface FileSystemItem {
  id: number;
  type: ItemType;
  name: string;
  content?: FileSystemItem[];
  /** System items (Desktop, Start Menu, ...) can't be deleted or renamed */
  protected?: boolean;
}

/** An item in the recycle bin, with what's needed to restore it. */
export interface RecycledItem {
  item: FileSystemItem;
  /** Folder it was deleted from */
  originalPath: PathItem[];
  /** Saved file contents of the item and everything inside it, by file id */
  fileData: Record<number, string>;
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
