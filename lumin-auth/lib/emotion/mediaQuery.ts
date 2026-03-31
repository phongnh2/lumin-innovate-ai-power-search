/* eslint-disable prefer-spread */
import { CSSInterpolation } from '@emotion/css';
import { css, SerializedStyles } from '@emotion/react';

import { BreakpointKey, Breakpoints } from '@/ui';

/**
 * https://tobbelindstrom.com/blog/how-to-create-a-breakpoint-mixin-with-styled-components/
 */

// type TCssFunction = typeof css;
type TCssFunction = {
  (template: TemplateStringsArray, ...args: Array<CSSInterpolation>): SerializedStyles;
};

type QueryAccumulator = Record<BreakpointKey, TCssFunction>;

const breakpointKeys = Array.from(Object.keys(Breakpoints) as ArrayLike<BreakpointKey>);

export const mediaQuery = breakpointKeys.reduce<QueryAccumulator>((accumulator: QueryAccumulator, label: BreakpointKey) => {
  accumulator[label] = (template, ...args) => {
    return css`
      @media screen and (min-width: ${Breakpoints[label]}px) {
        ${css(template, ...args)};
      }
    `;
  };
  return accumulator;
}, {} as QueryAccumulator);
