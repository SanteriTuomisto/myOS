import type { FileSystemItem, OpenApplicationInput, PathItem } from '@/types';

export interface CommandContext {
  /** Current folder path, starting from the root */
  path: PathItem[];
  /** Contents of the current folder */
  folder: FileSystemItem[];
  openApplication: (input: OpenApplicationInput) => void;
}

export interface CommandResult {
  response: string;
  /** Folder path after the command */
  path: PathItem[];
}

export function runCommand(text: string, { path, folder, openApplication }: CommandContext): CommandResult {
  const argsIndex = text.indexOf(' ');
  const command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;
  const param = argsIndex !== -1 ? text.substring(argsIndex + 1).toLowerCase() : '';

  switch (command) {
    case 'help':
      return { response: 'commands: ls, cd {0}, open {0}', path };
    case 'ls':
      return { response: folder.map((item) => `${item.name} (${item.type}), `).join(''), path };
    case 'cd': {
      if (param === '..') {
        return { response: '', path: path.length > 1 ? path.slice(0, -1) : path };
      }
      const target = folder.find((item) => item.type === 'folder' && item.name.toLowerCase() === param);
      if (!target) {
        return { response: 'No such folder', path };
      }
      return { response: '', path: [...path, { id: target.id, name: target.name }] };
    }
    case 'open': {
      const item = folder.find((f) => f.name.toLowerCase() === param);
      if (!item) {
        return { response: 'No such file or program', path };
      }
      openApplication({
        name: item.name,
        type: item.type === 'folder' ? 'fileExplorer' : item.type,
        fileSystemId: item.id,
      });
      return { response: '', path };
    }
    default:
      return { response: `Unknown command: ${command}, try help`, path };
  }
}
