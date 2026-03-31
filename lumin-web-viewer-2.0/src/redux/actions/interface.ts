import { AnyAction } from 'redux';

import { AppDispatch } from 'store';

export type ActionFunction =
  | ((...args: unknown[]) => AnyAction)
  | ((...args2: unknown[]) => (dispatch?: AppDispatch) => void | Promise<void>);

export type ActionType = Record<string, ActionFunction>;