export interface IRpcRequest<T = unknown> {
  readonly id: string | number;
  readonly method: string;
  readonly params?: T;
  readonly user?: {
    _id: string;
  };
}
