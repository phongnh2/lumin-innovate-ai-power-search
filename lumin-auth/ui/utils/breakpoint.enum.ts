export enum Breakpoints {
  xs = 480,
  sm = 600,
  md = 768, // tablet breakpoint
  lg = 992,
  lgr = 1024,
  xl = 1200, // desktop breakpoint
  xxl = 1440,
  xxxl = 1600
}

export type BreakpointKey = keyof typeof Breakpoints;
