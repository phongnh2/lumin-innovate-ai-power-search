/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';

type RouteConfig = {
  handler: string;
  status?: number;
  args: (req: any, res: any) => any[];
};

const ROUTES: Record<string, RouteConfig> = {
  'POST /sign-in': {
    handler: 'handleSignIn',
    args: (req, res) => [req.body, req, res]
  },
  'POST /forgot-password': {
    handler: 'handleForgotPassword',
    args: (req, res) => [req.body, req, res]
  },
  'POST /sign-up-invitation': {
    handler: 'handleSignUpInvitation',
    status: 201,
    args: (req, res) => [req.body, req, res]
  },
  'POST /sign-out': {
    handler: 'handleSignOut',
    status: 204,
    args: (req, res) => [req, res]
  },
  'POST /force-log-out': {
    handler: 'handleForceLogout',
    status: 204,
    args: (req, res) => [req, res]
  },
  'POST /create-temporary-access-url': {
    handler: 'createTemporaryAccess',
    args: (req, res) => [req, res]
  }
};

jest.mock('next-api-decorators', () => ({
  __esModule: true,

  Body: () => () => {},
  Catch: () => () => {},
  Get: () => () => {},
  Post: () => () => {},
  Req: () => () => {},
  Res: () => () => {},
  HttpCode: () => () => {},
  ValidationPipe: () => (v: any) => v,

  createHandler: (Controller: any) => async (req: any, res: any) => {
    const controller = new Controller();
    const path = req.url.replace('/api/auth', '');
    const key = `${req.method.toUpperCase()} ${path}`;
    const route = ROUTES[key];

    if (!route) {
      res.statusCode = 404;
      return;
    }

    const result = await controller[route.handler](...route.args(req, res));

    if (route.status) {
      res.statusCode = route.status;
    } else if (result !== undefined) {
      res.statusCode ??= 200;
      res.data = result;
    }
  }
}));

jest.mock('@/middlewares/RateLimitGuard', () => ({
  __esModule: true,
  default: () => () => {}
}));

jest.mock('@/middlewares', () => ({
  AuthGuard: () => () => {},
  MobileAuthGuard: () => () => {}
}));

jest.mock('@/lib/grpc', () => ({
  __esModule: true,
  default: {
    kratos: {
      handleSignOut: jest.fn(),
      handleForceLogout: jest.fn(),
      verifyUserInvitationToken: jest.fn()
    },
    contractAuthService: {
      handleSignOut: jest.fn(),
      handleForceLogout: jest.fn()
    }
  }
}));

jest.mock('@/lib/grpc/services/kratos', () => ({
  kratosService: {
    afterSignUpInvitation: jest.fn()
  }
}));

jest.mock('@/services/auth.service', () => ({
  authService: {
    verifySignIn: jest.fn(),
    verifyForgotPassword: jest.fn(),
    verifyRegisterAccount: jest.fn()
  }
}));

jest.mock('@/lib/ory', () => ({
  frontendApi: {
    updateLoginFlow: jest.fn(),
    updateRecoveryFlow: jest.fn()
  },
  identityApi: {
    createRecoveryLink: jest.fn()
  },
  constructFlowCsrfToken: jest.fn(() => 'csrf-token')
}));

import grpc from '@/lib/grpc';
import { frontendApi, identityApi } from '@/lib/ory';
import { authService } from '@/services/auth.service';

import handler from '../[[...params]]';

function mockReqRes(method: string, url: string, body?: any) {
  const req: any = {
    method,
    url,
    body,
    headers: {},
    query: {}
  };

  const res: any = {
    statusCode: undefined,
    headers: {},
    data: undefined,
    setHeader(k: string, v: any) {
      this.headers[k] = v;
    },
    getHeader(k: string) {
      return this.headers[k];
    }
  };

  return { req, res };
}

const mockFlow = { id: 'flow-id', ui: { nodes: [] } };

describe('Auth API [[...params]] – FINAL (no node-mocks-http)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /sign-in → success', async () => {
    (authService.verifySignIn as jest.Mock).mockResolvedValue({ error: null });
    (frontendApi.updateLoginFlow as jest.Mock).mockResolvedValue({
      data: { session: { identity: { id: 'identity-id' } } },
      headers: {}
    });

    const { req, res } = mockReqRes('POST', '/api/auth/sign-in', {
      email: 'a@mail.com',
      password: '123',
      flow: mockFlow
    });

    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  it('POST /sign-out → clear cookie', async () => {
    const { req, res } = mockReqRes('POST', '/api/auth/sign-out');
    req.sessionId = 'sid';

    await handler(req, res);
    expect(res.statusCode).toBe(204);
    expect(grpc.kratos.handleSignOut).toHaveBeenCalled();
  });

  it('POST /create-temporary-access-url → success', async () => {
    (identityApi.createRecoveryLink as jest.Mock).mockResolvedValue('url');

    const { req, res } = mockReqRes('POST', '/api/auth/create-temporary-access-url');
    req.user = { identityId: 'id' };

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.data).toBe('url');
  });
});
