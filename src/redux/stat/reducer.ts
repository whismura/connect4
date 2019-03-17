import { INCREMENT_LOSE_STAT, INCREMENT_TIE_STAT, INCREMENT_WIN_STAT, StatActions } from './actions';

export interface IStatState {
  numLose: number;
  numTie: number;
  numWin: number;
  totalGamesPlayed: number;
}

const initialState = {
  numLose: 0,
  numTie: 0,
  numWin: 0,
  totalGamesPlayed: 0,
};

export const reducer = (state: IStatState = initialState, action: StatActions) => {
  switch (action.type) {
    case INCREMENT_WIN_STAT:
      return {
        ...state,
        numWin: state.numWin + 1,
        totalGamesPlayed: state.totalGamesPlayed + 1,
      };
    case INCREMENT_LOSE_STAT:
      return {
        ...state,
        numLose: state.numLose + 1,
        totalGamesPlayed: state.totalGamesPlayed + 1,
      };
    case INCREMENT_TIE_STAT:
      return {
        ...state,
        numTie: state.numTie + 1,
        totalGamesPlayed: state.totalGamesPlayed + 1,
      };
            
    default:
      return initialState;
  }
};