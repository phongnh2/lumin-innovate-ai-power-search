/* eslint-disable prefer-spread */
import { css, ThemedCssFunction } from 'styled-components';

import { Breakpoints, BreakpointKey } from 'constants/styles/Breakpoints';

/**
 * https://tobbelindstrom.com/blog/how-to-create-a-breakpoint-mixin-with-styled-components/
 */

type QueryAccumulator<T extends object> = Record<BreakpointKey, ThemedCssFunction<T>>;

export const mediaQuery = Object.keys(Breakpoints).reduce(
  (accumulator: QueryAccumulator<any>, label: BreakpointKey) => {
    accumulator[label] = (...args: unknown[]) => {
      const [first, ...rest] = args;
      return css`
        @media screen and (min-width: ${Breakpoints[label]}px) {
          ${css.apply(null, [first, ...rest])};
        }
      `;
    };
    return accumulator;
  },
  {} as QueryAccumulator<any>
);

export const mediaQueryDown = Object.keys(Breakpoints).reduce(
  (accumulator: QueryAccumulator<any>, label: BreakpointKey) => {
    accumulator[label] = (...args: unknown[]) => {
      const [first, ...rest] = args;
      return css`
        @media screen and (max-width: ${Breakpoints[label] - 0.02}px) {
          ${css.apply(null, [first, ...rest])};
        }
      `;
    };
    return accumulator;
  },
  {} as QueryAccumulator<any>
);
