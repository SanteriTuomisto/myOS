import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import RecycleBin from '@/components/running/recycleBin/RecycleBin.vue';
import { createTestPinia } from '../../../utils';
import { useFileSystemStore } from '@/stores/fileSystem';

describe('RecycleBin', () => {
  let pinia: Pinia;
  let fileSystem: ReturnType<typeof useFileSystemStore>;

  beforeEach(() => {
    pinia = createTestPinia();
    fileSystem = useFileSystemStore();
  });

  const mountBin = () => mount(RecycleBin, { global: { plugins: [pinia] } });
  const button = (wrapper: ReturnType<typeof mountBin>, text: string) =>
    wrapper.findAll('button').find((candidate) => candidate.text() === text)!;

  it('says when it is empty and disables the toolbar', () => {
    const wrapper = mountBin();

    expect(wrapper.text()).toContain('The recycle bin is empty');
    expect(button(wrapper, 'Restore all').attributes('disabled')).toBeDefined();
    expect(button(wrapper, 'Empty bin').attributes('disabled')).toBeDefined();
  });

  it('lists deleted items with where they came from', () => {
    fileSystem.deleteItem(fileSystem.findFolderPath(3)!, 5);
    const wrapper = mountBin();

    const row = wrapper.find('.row');
    expect(row.find('.name').text()).toBe('Text');
    expect(row.find('.location').text()).toBe('home/My Computer/Documents/');
  });

  it('restores one item', async () => {
    const myComputer = fileSystem.findFolderPath(0)!;
    fileSystem.deleteItem(myComputer, 4);
    fileSystem.deleteItem(myComputer, 3);
    const wrapper = mountBin();

    await wrapper.findAll('.row')[0].find('button').trigger('click');

    expect(wrapper.findAll('.row').map((row) => row.find('.name').text())).toEqual(['Documents']);
    expect(fileSystem.getFolderContent(myComputer)?.map((item) => item.id)).toEqual([4]);
  });

  it('restores everything', async () => {
    const myComputer = fileSystem.findFolderPath(0)!;
    fileSystem.deleteItem(myComputer, 4);
    fileSystem.deleteItem(myComputer, 3);
    const wrapper = mountBin();

    await button(wrapper, 'Restore all').trigger('click');

    expect(wrapper.findAll('.row')).toHaveLength(0);
    expect(fileSystem.getFolderContent(myComputer)).toHaveLength(2);
  });

  it('empties the bin for good', async () => {
    fileSystem.deleteItem(fileSystem.findFolderPath(0)!, 4);
    const wrapper = mountBin();

    await button(wrapper, 'Empty bin').trigger('click');

    expect(fileSystem.recycleBin).toEqual([]);
    expect(wrapper.text()).toContain('The recycle bin is empty');
  });
});
