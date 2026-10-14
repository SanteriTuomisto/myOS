import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MonsterSlayer from './MonsterSlayer.vue';
import FightView from './FightView.vue';

describe('MonsterSlayer', () => {
  it('starts on the main menu and opens the fight view', async () => {
    const wrapper = mount(MonsterSlayer);
    expect(wrapper.findAll('button').map((b) => b.text())).toEqual(['shop', 'gear', 'fight']);
    expect(wrapper.findComponent(FightView).exists()).toBe(false);

    await wrapper.findAll('button')[2].trigger('click');

    const fight = wrapper.findComponent(FightView);
    expect(fight.exists()).toBe(true);
    expect(fight.props()).toEqual({ startPlayerHealth: 100, startMonsterHealth: 100 });
  });

  it('shop and gear views are not implemented yet and render nothing', async () => {
    const wrapper = mount(MonsterSlayer);
    await wrapper.findAll('button')[0].trigger('click');
    expect(wrapper.find('.game').text()).toBe('');
  });
});
