import { combineReducers, createStore } from "redux";

import { IStatState, reducer as StatReducer } from "./stat/reducer";

export interface IRootState {
  stat: IStatState;
}

export const store = createStore(
  combineReducers({
    stat: StatReducer,
  })
);
