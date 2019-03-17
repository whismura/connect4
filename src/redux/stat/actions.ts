// Define Actions

export const INCREMENT_WIN_STAT = 'INCREMENT_WIN_STAT';
export type INCREMENT_WIN_STAT = typeof INCREMENT_WIN_STAT;

export interface IncrementWinStatAction {
  type: INCREMENT_WIN_STAT;
}

export const INCREMENT_LOSE_STAT = 'INCREMENT_LOSE_STAT';
export type INCREMENT_LOSE_STAT = typeof INCREMENT_LOSE_STAT;

export interface IncrementLoseStatAction {
  type: INCREMENT_LOSE_STAT;
}

export const INCREMENT_TIE_STAT = 'INCREMENT_TIE_STAT';
export type INCREMENT_TIE_STAT = typeof INCREMENT_TIE_STAT;

export interface IncrementTieStatAction {
  type: INCREMENT_TIE_STAT;
}

export type StatActions = IncrementWinStatAction | IncrementLoseStatAction | IncrementTieStatAction;

// Define Action generators

export function incrementWinStat() {
  return {
    type: INCREMENT_WIN_STAT
  };
}

export function incrementLoseStat() {
  return {
    type: INCREMENT_LOSE_STAT
  };
}

export function incrementTieStat() {
  return {
    type: INCREMENT_TIE_STAT
  };
}