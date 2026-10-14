import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import StartMenu from '@/components/running/taskBar/StartMenu.vue';
import { createTestPinia } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';
import { useFileSystemStore } from '@/stores/fileSystem';
import { useSystemStore } from '@/stores/system';

describe('StartMenu', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
    useSystemStore().showStartMenu = true;
  });

  const mountMenu = (showStartMenu = true) => mount(StartMenu, {
    props: { showStartMenu },
    global: { plugins: [pinia] },
  });

  const itemByText = (wrapper: ReturnType<typeof mountMenu>, text: string) =>
    wrapper.findAll('.menu-item').find((item) => item.text() === text)!;

  it('is hidden unless shown', () => {
    expect(mountMenu(false).find('#menu').exists()).toBe(false);
  });

  it('lists the Start Menu items with icons, followed by Shut down', () => {
    const wrapper = mountMenu();
    const expected = useFileSystemStore().getTopLevelFolder('Start Menu').map((item) => item.name);

    const items = wrapper.findAll('.menu-item');

    expect(items.map((item) => item.text())).toEqual([...expected, 'Shut down']);
    expect(items.every((item) => item.find('svg').exists())).toBe(true);
  });

  it('opens the app and closes the menu when an item is clicked', async () => {
    const wrapper = mountMenu();
    const applications = useApplicationsStore();

    await itemByText(wrapper, 'Terminal').trigger('click');

    expect(applications.applications).toHaveLength(1);
    expect(applications.applications[0]).toMatchObject({ name: 'Terminal', type: 'terminal', fileSystemId: 10 });
    expect(useSystemStore().showStartMenu).toBe(false);
  });

  it('opens folders in the file explorer', async () => {
    const fileSystem = useFileSystemStore();
    const folder = fileSystem.addItem(fileSystem.findFolderPath(6)!, 'folder', 'Games')!;
    const wrapper = mountMenu();

    await itemByText(wrapper, 'Games').trigger('click');

    expect(useApplicationsStore().applications[0]).toMatchObject({
      name: 'Games',
      type: 'fileExplorer',
      fileSystemId: folder.id,
    });
  });

  it('powers off with Shut down', async () => {
    const system = useSystemStore();
    system.powerOn = true;
    const wrapper = mountMenu();

    await itemByText(wrapper, 'Shut down').trigger('click');

    expect(system.powerOn).toBe(false);
    expect(system.showStartMenu).toBe(false);
  });
});
