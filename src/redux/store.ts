// import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { combineReducers, createStore } from 'redux';

import { IStatState, reducer as StatReducer } from './stat/reducer';
// import { reducer as UserReducer, UserState } from './user/reducer';
// import thunk from 'redux-thunk';
// import { GenericStoreEnhancer } from 'redux';
// import { authReducer as AuthReducer, AuthState } from './auth/reducer';

// declare global {
//   interface Window {
//     __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: (enhancer: GenericStoreEnhancer) => GenericStoreEnhancer;
//   }
// }

export interface IRootState {
  stat: IStatState;
}

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  combineReducers({
    stat: StatReducer,
    // user: UserReducer,
    // auth: AuthReducer
  }),
  // composeEnhancers(applyMiddleware(thunk))
);