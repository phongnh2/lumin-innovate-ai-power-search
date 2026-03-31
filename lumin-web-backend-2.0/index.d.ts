// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      anonymousUserId: string;
      session?: Session;
      user?: Pick<User, '_id' | 'email'>;
      eventAttributes?: {
        httpAttributes: Record<string, any>,
        commonAttributes: Record<string, any> & { flowId?: string },
      },
      logDelayTime?: number,
    }
  }
}

declare module 'express' {
  export interface Response {
    locals: {
      eventData?: {
        userId: boolean,
        userSignUp: boolean,
      }
    };
  }
}
