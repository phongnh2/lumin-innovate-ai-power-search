/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable global-require */
/* eslint-disable import/no-import-module-exports */
import { legacy_createStore, applyMiddleware, Middleware, Store, Reducer } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from 'reducers/rootReducer';

declare const module: { hot: { accept: (...params: any[]) => void } };

const isDevelopment = process.env.NODE_ENV === 'development';
const middleware: Middleware[] = [thunk];

if (isDevelopment) {
  const { createLogger } = require(`redux-logger`);
  const logger = createLogger({ collapsed: true });
  middleware.push(logger);
}

const store: Store<ReturnType<typeof rootReducer>> = legacy_createStore(rootReducer, applyMiddleware(...middleware));

if (isDevelopment && module.hot) {
  module.hot.accept('reducers/rootReducer', async () => {
    const updatedReducer = (await import('reducers/rootReducer')) as unknown as { default: Reducer };
    store.replaceReducer(updatedReducer.default);
  });
}

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export { store };
