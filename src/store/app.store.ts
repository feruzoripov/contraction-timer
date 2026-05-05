import { configureStore } from '@reduxjs/toolkit';
import { mdhPersistMiddleware } from './timer/timer.middleware';
import persistState from 'redux-localstorage';
import { rootReducer } from './root.reducer';

// Type definitions are incorrect, use 'any' to bypass (https://github.com/elgerlambert/redux-localstorage/issues/78)
const persistStateEnhancer: any = persistState(['timer'] as any);

export const createStore = (persist: boolean) => configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(mdhPersistMiddleware),
  enhancers: persist ? [persistStateEnhancer] : [],
});
