import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import Desktop from '@/components/running/desktop/Desktop.vue';
import DesktopItem from '@/components/running/desktop/DesktopItem.vue';
import { createTestPinia } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';
import { useFileSystemStore } from '@/stores/fileSystem';
import { useSettingsStore } from '@/stores/settings';

const WindowStub = {
  props: ['app', 'index', 'hideBottomBorder', 'minW', 'minH', 'initWidth', 'initHeight'],
  template: '<div class="window-stub"><slot /></div>',
};

const TextEditorStub = {
  props: ['id', 'fileSystemId'],
  template: '<div class="text-editor-stub" />',
};

const stubs = {
  Window: WindowStub,
  FileExplorer: true,
  MusicPlayer: true,
  Browser: true,
  TextEditor: TextEditorStub,
  TerminalWindow: true,
  SettingsWindow: true,
  MonsterSlayer: true,
};

describe('Desktop', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
  });

  const mountDesktop = () => mount(Desktop, { global: { plugins: [pinia], stubs } });

  it('shows the items of the Desktop folder', () => {
    const wrapper = mountDesktop();
    const expected = useFileSystemStore().getTopLevelFolder('Desktop').map((item) => item.name);

    const names = wrapper.findAll('.item-name').map((item) => item.text());

    expect(names).toEqual(expected);
    expect(names).toContain('Recycle Bin');
    expect(wrapper.findAll('.desktop-item svg')).toHaveLength(expected.length);
  });

  it('shows items added to the Desktop folder', async () => {
    const wrapper = mountDesktop();
    const fileSystem = useFileSystemStore();

    fileSystem.addItem(fileSystem.findFolderPath(12)!, 'folder', 'Projects');
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.item-name').map((item) => item.text())).toContain('Projects');
  });

  it('opens an app when an item is double clicked', async () => {
    const wrapper = mountDesktop();
    const applications = useApplicationsStore();

    const terminal = wrapper.findAllComponents(DesktopItem).find((item) => item.text() === 'Terminal')!;
    await terminal.trigger('dblclick');

    expect(applications.applications).toHaveLength(1);
    expect(applications.applications[0]).toMatchObject({ name: 'Terminal', type: 'terminal', fileSystemId: 17 });
    expect(wrapper.findAll('.window-stub')).toHaveLength(1);
    expect(wrapper.findComponent({ name: 'TerminalWindow' }).exists()).toBe(true);
  });

  it('opens folders in the file explorer', async () => {
    const fileSystem = useFileSystemStore();
    const folder = fileSystem.addItem(fileSystem.findFolderPath(12)!, 'folder', 'Projects')!;
    const wrapper = mountDesktop();
    const applications = useApplicationsStore();

    const item = wrapper.findAllComponents(DesktopItem).find((i) => i.text() === 'Projects')!;
    await item.trigger('dblclick');

    expect(applications.applications[0]).toMatchObject({
      name: 'Projects',
      type: 'fileExplorer',
      fileSystemId: folder.id,
    });
    expect(wrapper.findComponent({ name: 'FileExplorer' }).props('fileSystemId')).toBe(folder.id);
  });

  it('renders a window per open app with its type specific sizes', async () => {
    const applications = useApplicationsStore();
    applications.openApplication({ name: 'Files', type: 'fileExplorer' });
    applications.openApplication({ name: 'Browser', type: 'browser' });
    applications.updateApplication(1, { size: { width: 900, height: 700 } });
    const wrapper = mountDesktop();

    const windows = wrapper.findAllComponents(WindowStub);

    expect(windows).toHaveLength(2);
    expect(windows[0].props()).toMatchObject({ index: 0, minW: 450, minH: 350, hideBottomBorder: true });
    expect(windows[1].props()).toMatchObject({ index: 1, minW: 400, minH: 250, initWidth: 900, initHeight: 700 });

    applications.closeApplication(0);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAllComponents(WindowStub)).toHaveLength(1);
  });

  it('passes the app and file ids to the text editor', () => {
    const applications = useApplicationsStore();
    applications.openApplication({ name: 'Text', type: 'file', fileSystemId: 4 });
    const wrapper = mountDesktop();

    expect(wrapper.findComponent(TextEditorStub).props()).toMatchObject({ id: 0, fileSystemId: 4 });
  });

  it('uses the background from the settings', async () => {
    const wrapper = mountDesktop();

    useSettingsStore().setBackground('2');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.desktop-background').classes()).toContain('desktop-background-2');
  });
});
