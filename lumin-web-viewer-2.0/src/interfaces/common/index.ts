export interface IBasicResponse {
  message: string;
  statusCode: number;
}

export interface IRouteConfig {
  path: string;
  component: JSX.Element;
  exact: boolean;
  sidebar: boolean;
  header: boolean;
  auth: boolean;
  pageTitle: string;
  fullWidth?: boolean;
  title?: string;
}

export type Nullable<T> = T | null | undefined;

type StringValues<T> = {
  [K in keyof T]: T[K] extends string ? T[K] : never;
}[keyof T];

type NumberValues<T> = {
  [K in keyof T]: T[K] extends number ? T[K] : never;
}[keyof T];

export type EnumAsStringUnion<T> = `${StringValues<T>}` | NumberValues<T>;