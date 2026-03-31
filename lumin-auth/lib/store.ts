import { configureStore, Store } from '@reduxjs/toolkit';
import { CurriedGetDefaultMiddleware } from '@reduxjs/toolkit/dist/getDefaultMiddleware';
import { merge } from 'lodash';

import { api } from '@/features/api-slice';
import { RecursivePartial } from '@/interfaces/custom-type';

import { rootReducer, RootState } from './reducers';

export let store: Store | undefined;

const storeConfig = {
  reducer: rootReducer,
  middleware: (getDefaultMiddleware: CurriedGetDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
};

const initStore = (preloadedState: RecursivePartial<RootState>) => configureStore({ ...storeConfig, preloadedState });

export const initializeStore = (preloadedState: RecursivePartial<RootState>) => {
  let _store = store ?? initStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore(merge({}, store.getState(), preloadedState));
    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export function createStore(initialState: RecursivePartial<RootState>) {
  return initializeStore(initialState);
}

// FIXME: we need fix this type later
export type AppDispatch = any;
