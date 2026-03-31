import { Breakpoints } from './constants';

export type BreakpointsType = typeof Breakpoints[keyof typeof Breakpoints];
