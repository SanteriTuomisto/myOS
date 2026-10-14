import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import Desktop from '@/components/running/desktop/Desktop.vue';
import DesktopItem from '@/components/running/desktop/DesktopItem.vue';
import ExternalApp from '@/components/running/desktop/ExternalApp.vue';
import { apps } from '@/apps/registry';
import type { AppType } from '@/types';
import { createTestPinia } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';
import { useFileSystemStore } from '@/stores/fileSystem';
import { useSettingsStore } from '@/stores/settings';

const WindowStub = {
  props: ['app', 'index', 'hideBottomBorder', 'minW', 'minH', 'initWidth', 'initHeight'],
  template: '<div class="window-stub"><slot :interactive="true" /></div>',
};

// The registry loads the editor lazily, so it's mocked instead of stubbed by name
const TextEditorStub = vi.hoisted(() => ({
  props: ['id', 'fileSystemId'],
  template: '<div class="text-editor-stub" />',
}));
vi.mock('@/components/running/editor/TextEditor.vue', () => ({ __esModule: true, default: TextEditorStub }));

const stubs = {
  Window: WindowStub,
  FileExplorer: true,
  MusicPlayer: true,
  Browser: true,
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

  it('passes the app and file ids to the text editor', async () => {
    const applications = useApplicationsStore();
    applications.openApplication({ name: 'Text', type: 'file', fileSystemId: 4 });
    const wrapper = mountDesktop();
    await flushPromises();

    expect(wrapper.findComponent(TextEditorStub).props()).toMatchObject({ id: 0, fileSystemId: 4 });
  });

  it('opens external apps in an iframe window with their registry sizes', async () => {
    const wrapper = mountDesktop();

    const synth = wrapper.findAllComponents(DesktopItem).find((item) => item.text() === 'Synth')!;
    await synth.trigger('dblclick');

    const window = wrapper.findComponent(WindowStub);
    expect(window.props()).toMatchObject({
      minW: apps.synth.minSize.width,
      minH: apps.synth.minSize.height,
      initWidth: apps.synth.defaultSize.width,
      initHeight: apps.synth.defaultSize.height,
      hideBottomBorder: undefined,
    });
    expect(wrapper.findComponent(ExternalApp).props()).toEqual({
      url: apps.synth.url,
      name: 'Synth',
      interactive: true,
    });
  });

  it('skips open apps whose id is no longer in the registry', () => {
    const applications = useApplicationsStore();
    applications.openApplication({ name: 'Old app', type: 'removedApp' as AppType });
    applications.openApplication({ name: 'Terminal', type: 'terminal' });
    const wrapper = mountDesktop();

    const windows = wrapper.findAllComponents(WindowStub);
    expect(windows).toHaveLength(1);
    expect(windows[0].props('index')).toBe(1);
  });

  it('uses the background from the settings', async () => {
    const wrapper = mountDesktop();

    useSettingsStore().setBackground('2');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.desktop-background').classes()).toContain('desktop-background-2');
  });
});
