import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import FileSystemItem from '@/components/running/fileExplorer/FileSystemItem.vue';
import FolderIcon from '@/assets/FolderIcon.vue';
import { createTestPinia, stubSmallScreen } from '../../../utils';
import { useApplicationsStore } from '@/stores/applications';
import type { ItemType } from '@/types';

describe('FileSystemItem', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createTestPinia();
  });

  const mountItem = (props: { id: number; type: ItemType; name?: string; selected?: boolean; editing?: boolean; error?: string }) =>
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

  describe('while renaming', () => {
    it('shows an input with the current name and emits the typed name', async () => {
      const wrapper = mountItem({ id: 4, type: 'file', name: 'Text', editing: true });
      const input = wrapper.find('input');
      expect((input.element as HTMLInputElement).value).toBe('Text');

      await input.setValue('Notes');
      await input.trigger('keydown.enter');
      await input.trigger('blur');

      expect(wrapper.emitted('rename')).toEqual([['Notes', 'enter'], ['Notes', 'blur']]);
    });

    it('emits cancelRename on Escape and marks an invalid name', async () => {
      const wrapper = mountItem({ id: 4, type: 'file', name: 'Text', editing: true, error: 'Taken' });

      await wrapper.find('input').trigger('keydown.esc');

      expect(wrapper.emitted('cancelRename')).toHaveLength(1);
      expect(wrapper.find('input').classes()).toContain('invalid');
      expect(wrapper.find('input').attributes('title')).toBe('Taken');
    });

    it('does not open, select or navigate from clicks in the input', async () => {
      const applications = useApplicationsStore();
      const wrapper = mountItem({ id: 3, type: 'folder', name: 'Documents', editing: true });

      await wrapper.find('input').trigger('click');
      await wrapper.find('input').trigger('dblclick');
      await wrapper.trigger('dblclick');

      expect(wrapper.emitted('selected')).toBeUndefined();
      expect(wrapper.emitted('folderClick')).toBeUndefined();
      expect(applications.applications).toEqual([]);
    });
  });

  describe('on phones', () => {
    it('the first tap selects, tapping a selected item opens it', async () => {
      stubSmallScreen(true);
      const applications = useApplicationsStore();

      const unselected = mountItem({ id: 4, type: 'file', name: 'Text' });
      await unselected.trigger('click');
      expect(unselected.emitted('selected')).toEqual([[4]]);
      expect(applications.applications).toEqual([]);

      const selected = mountItem({ id: 4, type: 'file', name: 'Text', selected: true });
      await selected.trigger('click');
      expect(selected.emitted('deselected')).toBeUndefined();
      expect(applications.applications).toEqual([
        expect.objectContaining({ name: 'Text', type: 'file', fileSystemId: 4 }),
      ]);
    });

    it('opens a selected folder on tap, and ignores double taps', async () => {
      stubSmallScreen(true);
      const wrapper = mountItem({ id: 3, type: 'folder', name: 'Documents', selected: true });

      await wrapper.trigger('dblclick');
      expect(wrapper.emitted('folderClick')).toBeUndefined();

      await wrapper.trigger('click');
      expect(wrapper.emitted('folderClick')).toEqual([[{ id: 3, name: 'Documents' }]]);
    });
  });
});
