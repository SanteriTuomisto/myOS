import { describe, expect, it, vi } from 'vitest';
import {
  attackMonster,
  canUseSpecialAttack,
  createFight,
  getRandomValue,
  healPlayer,
  healthBarStyle,
  specialAttackMonster,
  surrender,
} from './fight';

/** Make getRandomValue return its minimum (0) or its maximum (0.999...). */
function mockRandom(...values: number[]) {
  const spy = vi.spyOn(Math, 'random');
  values.forEach((value) => spy.mockReturnValueOnce(value));
  return spy;
}

describe('getRandomValue', () => {
  it('returns integers from min up to, but not including, max', () => {
    mockRandom(0, 0.9999);
    expect(getRandomValue(5, 12)).toBe(5);
    expect(getRandomValue(5, 12)).toBe(11);
  });
});

describe('fight rules', () => {
  it('starts with full health, round 0 and no winner', () => {
    expect(createFight(100, 80)).toEqual({
      playerHealth: 100,
      monsterHealth: 80,
      currentRound: 0,
      winner: null,
      logMessages: [],
    });
  });

  it('attack damages the monster by 5-11 and the monster strikes back', () => {
    const state = createFight(100, 100);
    mockRandom(0, 0.9999);

    attackMonster(state);

    expect(state.monsterHealth).toBe(95);
    expect(state.playerHealth).toBe(89);
    expect(state.currentRound).toBe(1);
    expect(state.logMessages).toEqual([
      { actionBy: 'monster', actionType: 'attack', actionValue: 11 },
      { actionBy: 'player', actionType: 'attack', actionValue: 5 },
    ]);
  });

  it('special attack deals 10-24 damage', () => {
    const state = createFight(100, 100);
    mockRandom(0.9999, 0);

    specialAttackMonster(state);

    expect(state.monsterHealth).toBe(76);
    expect(state.playerHealth).toBe(95);
  });

  it('special attack is available on round 0 and every 3rd round after', () => {
    const state = createFight(1000, 1000);
    const available: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      available.push(canUseSpecialAttack(state));
      attackMonster(state);
    }
    expect(available).toEqual([true, false, false, true, false, false, true]);
  });

  it('heal restores 8-19 health, capped at 100, before the monster attacks', () => {
    const state = createFight(100, 100);
    state.playerHealth = 50;
    mockRandom(0, 0);
    healPlayer(state);
    expect(state.playerHealth).toBe(50 + 8 - 5);
    expect(state.logMessages[1]).toEqual({ actionBy: 'player', actionType: 'heal', actionValue: 8 });

    state.playerHealth = 95;
    mockRandom(0.9999, 0);
    healPlayer(state);
    expect(state.playerHealth).toBe(100 - 5);
  });

  it('player wins when the monster drops to 0', () => {
    const state = createFight(100, 5);
    mockRandom(0, 0);
    attackMonster(state);
    expect(state.winner).toBe('player');
  });

  it('monster wins when the player drops to 0', () => {
    const state = createFight(5, 100);
    mockRandom(0, 0);
    attackMonster(state);
    expect(state.winner).toBe('monster');
  });

  it('is a draw when both drop to 0 in the same round', () => {
    const state = createFight(5, 5);
    mockRandom(0, 0);
    attackMonster(state);
    expect(state.winner).toBe('draw');
  });

  it('surrender lets the monster win', () => {
    const state = createFight(100, 100);
    surrender(state);
    expect(state.winner).toBe('monster');
  });

  it('health bar width never goes below 0%', () => {
    expect(healthBarStyle(42)).toEqual({ width: '42%' });
    expect(healthBarStyle(-7)).toEqual({ width: '0%' });
  });
});
