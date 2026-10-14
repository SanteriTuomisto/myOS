export type Combatant = 'player' | 'monster';
export type Winner = Combatant | 'draw';
export type ActionType = 'attack' | 'heal';

export interface LogMessage {
  actionBy: Combatant;
  actionType: ActionType;
  actionValue: number;
}

export interface FightState {
  playerHealth: number;
  monsterHealth: number;
  currentRound: number;
  winner: Winner | null;
  /** Newest message first. */
  logMessages: LogMessage[];
}

export const MAX_PLAYER_HEALTH = 100;

/** Random integer in [min, max). */
export function getRandomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function createFight(startPlayerHealth: number, startMonsterHealth: number): FightState {
  return {
    playerHealth: startPlayerHealth,
    monsterHealth: startMonsterHealth,
    currentRound: 0,
    winner: null,
    logMessages: [],
  };
}

/** The special attack can be used on every 3rd round (and on the very first one). */
export function canUseSpecialAttack(state: FightState): boolean {
  return state.currentRound % 3 === 0;
}

function addLogMessage(state: FightState, actionBy: Combatant, actionType: ActionType, actionValue: number) {
  state.logMessages.unshift({ actionBy, actionType, actionValue });
}

function determineWinner(state: FightState) {
  if (state.playerHealth <= 0 && state.monsterHealth <= 0) {
    state.winner = 'draw';
  } else if (state.playerHealth <= 0) {
    state.winner = 'monster';
  } else if (state.monsterHealth <= 0) {
    state.winner = 'player';
  }
}

/** The monster always strikes back after the player's move. */
function monsterTurn(state: FightState) {
  const attackValue = getRandomValue(5, 12);
  addLogMessage(state, 'monster', 'attack', attackValue);
  state.playerHealth -= attackValue;
  determineWinner(state);
}

export function attackMonster(state: FightState) {
  state.currentRound++;
  const attackValue = getRandomValue(5, 12);
  state.monsterHealth -= attackValue;
  addLogMessage(state, 'player', 'attack', attackValue);
  monsterTurn(state);
}

export function specialAttackMonster(state: FightState) {
  state.currentRound++;
  const attackValue = getRandomValue(10, 25);
  addLogMessage(state, 'player', 'attack', attackValue);
  state.monsterHealth -= attackValue;
  monsterTurn(state);
}

export function healPlayer(state: FightState) {
  state.currentRound++;
  const healValue = getRandomValue(8, 20);
  state.playerHealth = Math.min(state.playerHealth + healValue, MAX_PLAYER_HEALTH);
  addLogMessage(state, 'player', 'heal', healValue);
  monsterTurn(state);
}

export function surrender(state: FightState) {
  state.winner = 'monster';
}

/** Width style for a health bar; never negative. */
export function healthBarStyle(health: number): { width: string } {
  return { width: Math.max(health, 0) + '%' };
}
