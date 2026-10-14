import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import FileSystemItem from '@/components/running/fileExplorer/FileSystemItem.vue';
import FolderIcon from '@/assets/FolderIcon.vue';
import { createTestPinia } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';
import type { ItemType } from '@/types';

describe('FileSystemItem', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
  });

  const mountItem = (props: { id: number; type: ItemType; name?: string; selected?: boolean }) =>
    mount(FileSystemItem, { props, global: { plugins: [pinia] } });

  it('shows the name, icon and selected state', () => {
    const wrapper = mountItem({ id: 1, type: 'folder', name: 'Docs', selected: true });

    expect(wrapper.find('.text').text()).toBe('Docs');
    expect(wrapper.findComponent(FolderIcon).exists()).toBe(true);
    expect(wrapper.classes()).toContain('item-selected');
  });

  it('emits selected or deselected on click depending on state', async () => {
    const wrapper = mountItem({ id: 4, type: 'file', name: 'Text' });

    await wrapper.trigger('click');
    await wrapper.setProps({ selected: true });
    await wrapper.trigger('click');

    expect(wrapper.emitted('selected')).toEqual([[4]]);
    expect(wrapper.emitted('deselected')).toEqual([[4]]);
  });

  it('emits folderClick when a folder is double-clicked', async () => {
    const wrapper = mountItem({ id: 3, type: 'folder', name: 'Documents' });

    await wrapper.trigger('dblclick');

    expect(wrapper.emitted('folderClick')).toEqual([[{ id: 3, name: 'Documents' }]]);
    expect(useApplicationsStore().applications).toEqual([]);
  });

  it('opens other items as applications on double-click', async () => {
    const wrapper = mountItem({ id: 4, type: 'file', name: 'Text' });

    await wrapper.trigger('dblclick');

    expect(useApplicationsStore().applications).toEqual([
      expect.objectContaining({ name: 'Text', type: 'file', fileSystemId: 4 }),
    ]);
    expect(wrapper.emitted('folderClick')).toBeUndefined();
  });
});
