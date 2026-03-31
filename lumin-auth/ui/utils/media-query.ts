import { BreakpointKey, Breakpoints } from './breakpoint.enum';

export const mediaQueryUp = Object.entries(Breakpoints).reduce((prev, [key, breakpoint]) => {
  prev[key as BreakpointKey] = `@media (min-width: ${breakpoint}px)`;
  return prev;
}, {} as { [index in BreakpointKey]: string });

export const mediaQueryDown = Object.entries(Breakpoints).reduce((prev, [key, breakpoint]) => {
  prev[key as BreakpointKey] = `@media (max-width: ${Number(breakpoint) - 0.02}px)`;
  return prev;
}, {} as { [index in BreakpointKey]: string });
