import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ItemIcon from '@/components/_shared/ItemIcon.vue';
import FolderIcon from '@/assets/FolderIcon.vue';
import TrashIcon from '@/assets/TrashIcon.vue';
import type { ItemType } from '@/types';

describe('ItemIcon', () => {
  it.each<[ItemType, unknown]>([
    ['folder', FolderIcon],
    ['fileExplorer', FolderIcon],
    ['recycleBin', TrashIcon],
  ])('renders the right icon for %s', (type, icon) => {
    const wrapper = mount(ItemIcon, { props: { type } });

    expect(wrapper.findComponent(icon as never).exists()).toBe(true);
  });

  it('renders nothing for an unknown type', () => {
    const wrapper = mount(ItemIcon, { props: { type: 'nope' as ItemType } });

    expect(wrapper.find('svg').exists()).toBe(false);
  });
});
