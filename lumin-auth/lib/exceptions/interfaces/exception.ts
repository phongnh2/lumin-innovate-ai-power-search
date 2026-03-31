export interface IException<T = Record<string, unknown>> {
  message: string;
  meta?: T;
  code?: string | number;
}
