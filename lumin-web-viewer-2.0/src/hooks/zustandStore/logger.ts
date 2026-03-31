import { isEmpty } from 'lodash';
import { StateCreator, StoreMutatorIdentifier } from 'zustand';

const isDevelopment = process.env.NODE_ENV === 'development';

type LoggerType = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(f: StateCreator<T, [], []>, name?: string) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const result = f(set, get, store);
  if (!isDevelopment) {
    return result;
  }

  if (typeof result === 'object' && result !== null) {
    return Object.fromEntries(
      Object.entries(result).map(([key, value]: [string, unknown]) => {
        let enhancedValue = value;
        if (typeof value === 'function') {
          enhancedValue = (...params: unknown[]) => {
            console.groupCollapsed(`Zustand ${name}/${key} @ ${new Date().toLocaleTimeString()}`);
            console.log('%c prev state', 'color: #9E9E9E; font-weight: bold;', get());
            value(...params);
            console.log(`%c action    ${key}: `, 'color: #03A9F4; font-weight: bold;', isEmpty(params) ? '' : params);
            console.log('%c next state', 'color: #4CAF50; font-weight: bold;', get());
            console.groupEnd();
          };
        }
        return [key, enhancedValue];
      })
    ) as typeof result;
  }
  return result;
};

export const logger = loggerImpl as unknown as LoggerType;
