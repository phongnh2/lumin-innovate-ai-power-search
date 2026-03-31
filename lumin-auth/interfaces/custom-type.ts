export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
