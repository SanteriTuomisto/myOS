import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FightView from '@/components/projects/monsterSlayer/FightView.vue';

function mountFight(startPlayerHealth = 100, startMonsterHealth = 100) {
  return mount(FightView, { props: { startPlayerHealth, startMonsterHealth } });
}

function button(wrapper: ReturnType<typeof mountFight>, text: string) {
  const found = wrapper.findAll('button').find((b) => b.text() === text);
  if (!found) throw new Error(`No button ${text}`);
  return found;
}

describe('FightView', () => {
  it('shows starting health and an empty log', () => {
    const wrapper = mountFight(100, 80);
    const bars = wrapper.findAll('.healthbar__value');
    expect(bars[0].text()).toBe('100/100');
    expect(bars[1].text()).toBe('80/80');
    expect(bars[1].attributes('style')).toContain('width: 80%');
    expect(wrapper.findAll('#log li')).toHaveLength(0);
  });

  it('attack updates health bars and the battle log', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const wrapper = mountFight();

    await button(wrapper, 'ATTACK').trigger('click');

    const bars = wrapper.findAll('.healthbar__value');
    expect(bars[0].text()).toBe('95/100');
    expect(bars[1].text()).toBe('95/100');
    const log = wrapper.findAll('#log li').map((li) => li.text().replace(/\s+/g, ' '));
    expect(log).toEqual(['Monster attacks and deals 5', 'Player attacks and deals 5']);
  });

  it('logs heals', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const wrapper = mountFight();

    await button(wrapper, 'HEAL').trigger('click');

    expect(wrapper.findAll('#log li')[1].text().replace(/\s+/g, ' ')).toBe('Player heals himself for 8');
    expect(wrapper.findAll('.healthbar__value')[0].text()).toBe('95/100');
  });

  it('disables special attack except every 3rd round', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const wrapper = mountFight();
    const special = () => button(wrapper, 'SPECIAL ATTACK');

    expect(special().attributes('disabled')).toBeUndefined();
    await button(wrapper, 'ATTACK').trigger('click');
    expect(special().attributes('disabled')).toBeDefined();
    await button(wrapper, 'ATTACK').trigger('click');
    expect(special().attributes('disabled')).toBeDefined();
    await button(wrapper, 'ATTACK').trigger('click');
    expect(special().attributes('disabled')).toBeUndefined();
  });

  it('shows the result and can start a new game', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const wrapper = mountFight(100, 5);

    await button(wrapper, 'ATTACK').trigger('click');
    expect(wrapper.find('h3').text()).toBe('You won!');
    expect(wrapper.find('#controls').exists()).toBe(false);
    expect(wrapper.findAll('.healthbar__value')[1].attributes('style')).toContain('width: 0%');

    await button(wrapper, 'Start New Game').trigger('click');
    expect(wrapper.find('#controls').exists()).toBe(true);
    expect(wrapper.findAll('.healthbar__value')[1].text()).toBe('5/5');
    expect(wrapper.findAll('#log li')).toHaveLength(0);
  });

  it('surrender means you lost; a draw is shown as such', async () => {
    const wrapper = mountFight();
    await button(wrapper, 'SURRENDER').trigger('click');
    expect(wrapper.find('h3').text()).toBe('You lost!');

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const draw = mountFight(5, 5);
    await button(draw, 'ATTACK').trigger('click');
    expect(draw.find('h3').text()).toBe("It's a draw!");
  });
});
