export enum Breakpoints {
  xs = 480,
  sm = 600,
  md = 768,
  lg = 992,
  lgr = 1024,
  xl = 1200,
  xlr = 1366,
  xxl = 1440,
  xxxl = 1600,
  xxxxl = 1920,
}

export type BreakpointKey = keyof typeof Breakpoints;
