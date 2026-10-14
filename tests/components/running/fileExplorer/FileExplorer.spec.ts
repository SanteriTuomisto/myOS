import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import FileExplorer from '@/components/running/fileExplorer/FileExplorer.vue';
import { createTestPinia } from '../../../utils';
import { useFileSystemStore } from '@/stores/fileSystem';
import { useApplicationsStore } from '@/stores/applications';

describe('FileExplorer', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
  });

  const mountExplorer = (props: { fileSystemId?: number } = {}) =>
    mount(FileExplorer, { props, global: { plugins: [pinia] } });

  const names = (wrapper: ReturnType<typeof mountExplorer>) =>
    wrapper.findAll('.item .text').map((el) => el.text());

  const item = (wrapper: ReturnType<typeof mountExplorer>, name: string) => {
    const found = wrapper.findAll('.item').find((el) => el.find('.text').text() === name);
    if (!found) {
      throw new Error(`No item ${name}`);
    }
    return found;
  };

  const button = (wrapper: ReturnType<typeof mountExplorer>, title: string) =>
    wrapper.find(`[title="${title}"] .icon`);

  it('lists the root items', () => {
    const wrapper = mountExplorer();

    expect(names(wrapper)).toEqual(['My Computer', 'Start Menu', 'Desktop', 'Browser', 'Music', 'Terminal']);
    expect(wrapper.find('.path').text()).toBe('home/');
    expect(wrapper.find('[title="Back"] .icon').exists()).toBe(false);
  });

  it('navigates into a folder on double-click and back / home again', async () => {
    const wrapper = mountExplorer();

    await item(wrapper, 'My Computer').trigger('dblclick');
    await item(wrapper, 'Documents').trigger('dblclick');

    expect(wrapper.find('.path').text()).toBe('home/My Computer/Documents/');
    expect(names(wrapper)).toEqual(['Text']);

    await button(wrapper, 'Back').trigger('click');
    expect(wrapper.find('.path').text()).toBe('home/My Computer/');
    expect(names(wrapper)).toEqual(['Documents', 'Text']);

    await item(wrapper, 'Documents').trigger('dblclick');
    await button(wrapper, 'Home').trigger('click');
    expect(wrapper.find('.path').text()).toBe('home/');
    expect(names(wrapper)).toContain('Desktop');
  });

  it('opens a non-folder item as an application on double-click', async () => {
    const wrapper = mountExplorer();
    const apps = useApplicationsStore();

    await item(wrapper, 'Terminal').trigger('dblclick');

    expect(apps.applications).toEqual([
      expect.objectContaining({ name: 'Terminal', type: 'terminal', fileSystemId: 20 }),
    ]);
    expect(wrapper.find('.path').text()).toBe('home/');
  });

  it('starts in the folder given by fileSystemId', () => {
    const wrapper = mountExplorer({ fileSystemId: 3 });

    expect(wrapper.find('.path').text()).toBe('home/My Computer/Documents/');
    expect(names(wrapper)).toEqual(['Text']);
  });

  it('starts at home when fileSystemId is not a folder', () => {
    const wrapper = mountExplorer({ fileSystemId: 5 });

    expect(wrapper.find('.path').text()).toBe('home/');
  });

  it('adds uniquely named folders and text files to the current folder', async () => {
    const wrapper = mountExplorer({ fileSystemId: 3 });
    const fs = useFileSystemStore();

    await button(wrapper, 'New folder').trigger('click');
    await button(wrapper, 'New folder').trigger('click');
    await button(wrapper, 'New text file').trigger('click');

    expect(names(wrapper)).toEqual(['Text', 'Folder 1', 'Folder 2', 'Text 1']);
    expect(fs.getFolderContent(fs.findFolderPath(3)!)?.map((i) => i.type))
      .toEqual(['file', 'folder', 'folder', 'file']);
  });

  it('shows newly added items inside a folder it navigated into', async () => {
    const wrapper = mountExplorer();

    await button(wrapper, 'New folder').trigger('click');
    await item(wrapper, 'Folder 1').trigger('dblclick');
    expect(names(wrapper)).toEqual([]);

    await button(wrapper, 'New text file').trigger('click');
    expect(names(wrapper)).toEqual(['Text 1']);
  });

  it('selects, deselects and deletes the selected items', async () => {
    const wrapper = mountExplorer({ fileSystemId: 0 });
    const deleteButton = () => button(wrapper, 'Delete');
    expect(deleteButton().classes()).toContain('disabled');

    await item(wrapper, 'Documents').trigger('click');
    await item(wrapper, 'Text').trigger('click');
    expect(wrapper.findAll('.item-selected')).toHaveLength(2);
    expect(deleteButton().classes()).not.toContain('disabled');

    await item(wrapper, 'Documents').trigger('click');
    expect(wrapper.findAll('.item-selected')).toHaveLength(1);

    await deleteButton().trigger('click');

    expect(names(wrapper)).toEqual(['Documents']);
    expect(wrapper.findAll('.item-selected')).toHaveLength(0);
    expect(deleteButton().classes()).toContain('disabled');
  });

  it('enables rename only with exactly one item selected', async () => {
    const wrapper = mountExplorer({ fileSystemId: 0 });
    const rename = () => button(wrapper, 'Rename');

    expect(rename().classes()).toContain('disabled');
    await item(wrapper, 'Documents').trigger('click');
    expect(rename().classes()).not.toContain('disabled');
    await item(wrapper, 'Text').trigger('click');
    expect(rename().classes()).toContain('disabled');
  });

  it('shows an empty folder when the current folder is deleted elsewhere', async () => {
    const wrapper = mountExplorer({ fileSystemId: 3 });
    const fs = useFileSystemStore();

    fs.deleteItem(fs.findFolderPath(0)!, 3);
    await wrapper.vm.$nextTick();

    expect(names(wrapper)).toEqual([]);
  });
});
