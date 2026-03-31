import { renderHook, act, waitFor } from '@testing-library/react';
import { LoginFlow, UiNodeInputAttributes } from '@ory/kratos-client';

import { kratosService } from 'services/oryServices';

import { useCreateLoginFlow, constructFlowCsrfToken } from '../useCreateLoginFlow';

jest.mock('services/oryServices', () => ({
  kratosService: {
    createBrowserLoginFlow: jest.fn(),
  },
}));

const mockLocationReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    reload: mockLocationReload,
    href: 'http://localhost:3000',
  },
  writable: true,
});

describe('useCreateLoginFlow', () => {
  const mockCsrfToken = 'mock-csrf-token';
  const mockFlow: LoginFlow = {
    id: 'flow-123',
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    issued_at: new Date().toISOString(),
    request_url: 'http://localhost:3000',
    type: 'browser',
    ui: {
      action: 'http://localhost:3000/api/login',
      method: 'POST',
      nodes: [
        {
          type: 'input',
          group: 'default',
          attributes: {
            name: 'csrf_token',
            type: 'hidden',
            value: mockCsrfToken,
            required: true,
            disabled: false,
            node_type: 'input',
          } as UiNodeInputAttributes,
          messages: [],
          meta: {},
        },
      ],
      messages: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (kratosService.createBrowserLoginFlow as jest.Mock).mockResolvedValue(mockFlow);
  });

  describe('createLoginFlow', () => {
    it('should create a new login flow when no initial flow is provided', async () => {
      const { result } = renderHook(() =>
        useCreateLoginFlow({ returnTo: 'http://localhost:3000', refresh: false })
      );

      let flowResult: Awaited<ReturnType<typeof result.current[0]>>;
      await act(async () => {
        flowResult = await result.current[0]();
      });

      expect(kratosService.createBrowserLoginFlow).toHaveBeenCalledWith({
        returnTo: 'http://localhost:3000',
        refresh: false,
      });
      expect(flowResult!.data).toEqual(mockFlow);
    });

    it('should reuse initial flow when it is valid and not expired', async () => {
      const { result } = renderHook(() =>
        useCreateLoginFlow({
          initial: mockFlow,
          returnTo: 'http://localhost:3000',
          refresh: false,
        })
      );

      let flowResult: Awaited<ReturnType<typeof result.current[0]>>;
      await act(async () => {
        flowResult = await result.current[0]();
      });

      expect(kratosService.createBrowserLoginFlow).not.toHaveBeenCalled();
      expect(flowResult!.data).toEqual(mockFlow);
    });

    it('should create new flow when refresh is true even if initial flow exists', async () => {
      const { result } = renderHook(() =>
        useCreateLoginFlow({
          initial: mockFlow,
          returnTo: 'http://localhost:3000',
          refresh: true,
        })
      );

      let flowResult: Awaited<ReturnType<typeof result.current[0]>>;
      await act(async () => {
        flowResult = await result.current[0]();
      });

      expect(kratosService.createBrowserLoginFlow).toHaveBeenCalled();
      expect(flowResult!.data).toEqual(mockFlow);
    });

    it('should create new flow when initial flow is expired', async () => {
      const expiredFlow: LoginFlow = {
        ...mockFlow,
        expires_at: new Date(Date.now() - 1000).toISOString(),
      };

      const { result } = renderHook(() =>
        useCreateLoginFlow({
          initial: expiredFlow,
          returnTo: 'http://localhost:3000',
          refresh: false,
        })
      );

      let flowResult: Awaited<ReturnType<typeof result.current[0]>>;
      await act(async () => {
        flowResult = await result.current[0]();
      });

      expect(kratosService.createBrowserLoginFlow).toHaveBeenCalled();
      expect(flowResult!.data).toEqual(mockFlow);
    });
  });

  describe('error handling', () => {
    it('should reload page when session is already available', async () => {
      const sessionError = {
        response: {
          data: {
            error: {
              id: 'session_already_available',
              status: 400,
            },
          },
        },
      };
      (kratosService.createBrowserLoginFlow as jest.Mock).mockRejectedValueOnce(sessionError);

      const { result } = renderHook(() =>
        useCreateLoginFlow({ returnTo: 'http://localhost:3000', refresh: false })
      );

      await expect(
        act(async () => {
          await result.current[0]();
        })
      ).rejects.toEqual(sessionError);

      expect(mockLocationReload).toHaveBeenCalled();
    });

    it('should throw error for non-session-available errors', async () => {
      const genericError = new Error('Network error');
      (kratosService.createBrowserLoginFlow as jest.Mock).mockRejectedValueOnce(genericError);

      const { result } = renderHook(() =>
        useCreateLoginFlow({ returnTo: 'http://localhost:3000', refresh: false })
      );

      await expect(
        act(async () => {
          await result.current[0]();
        })
      ).rejects.toThrow('Network error');

      expect(mockLocationReload).not.toHaveBeenCalled();
    });

    it('should handle error without response data', async () => {
      const errorWithoutResponse = { message: 'Unknown error' };
      (kratosService.createBrowserLoginFlow as jest.Mock).mockRejectedValueOnce(errorWithoutResponse);

      const { result } = renderHook(() =>
        useCreateLoginFlow({ returnTo: 'http://localhost:3000', refresh: false })
      );

      await expect(
        act(async () => {
          await result.current[0]();
        })
      ).rejects.toEqual(errorWithoutResponse);

      expect(mockLocationReload).not.toHaveBeenCalled();
    });
  });

  describe('callback stability', () => {
    it('should return stable callback reference', () => {
      const { result, rerender } = renderHook(() =>
        useCreateLoginFlow({ returnTo: 'http://localhost:3000', refresh: false })
      );

      const firstCallback = result.current[0];
      rerender();
      const secondCallback = result.current[0];

      expect(firstCallback).toBe(secondCallback);
    });

    it('should update callback when dependencies change', () => {
      const { result, rerender } = renderHook(
        (props: { returnTo: string; refresh: boolean }) => useCreateLoginFlow(props),
        { initialProps: { returnTo: 'http://localhost:3000', refresh: false } }
      );

      const firstCallback = result.current[0];
      rerender({ returnTo: 'http://localhost:3000/new', refresh: false });
      const secondCallback = result.current[0];

      expect(firstCallback).not.toBe(secondCallback);
    });
  });
});

describe('constructFlowCsrfToken', () => {
  const mockCsrfToken = 'mock-csrf-token';

  it('should extract csrf_token from flow nodes', () => {
    const flow: LoginFlow = {
      id: 'flow-123',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      issued_at: new Date().toISOString(),
      request_url: 'http://localhost:3000',
      type: 'browser',
      ui: {
        action: 'http://localhost:3000/api/login',
        method: 'POST',
        nodes: [
          {
            type: 'input',
            group: 'default',
            attributes: {
              name: 'csrf_token',
              type: 'hidden',
              value: mockCsrfToken,
              required: true,
              disabled: false,
              node_type: 'input',
            } as UiNodeInputAttributes,
            messages: [],
            meta: {},
          },
        ],
        messages: [],
      },
    };

    const result = constructFlowCsrfToken(flow);

    expect(result).toBe(mockCsrfToken);
  });

  it('should throw error when csrf_token node is missing', () => {
    const flowWithoutCsrf: LoginFlow = {
      id: 'flow-123',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      issued_at: new Date().toISOString(),
      request_url: 'http://localhost:3000',
      type: 'browser',
      ui: {
        action: 'http://localhost:3000/api/login',
        method: 'POST',
        nodes: [
          {
            type: 'input',
            group: 'default',
            attributes: {
              name: 'email',
              type: 'text',
              value: '',
              required: true,
              disabled: false,
              node_type: 'input',
            } as UiNodeInputAttributes,
            messages: [],
            meta: {},
          },
        ],
        messages: [],
      },
    };

    expect(() => constructFlowCsrfToken(flowWithoutCsrf)).toThrow('Missing csrf_token node');
  });

  it('should throw error when nodes array is empty', () => {
    const flowWithEmptyNodes: LoginFlow = {
      id: 'flow-123',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      issued_at: new Date().toISOString(),
      request_url: 'http://localhost:3000',
      type: 'browser',
      ui: {
        action: 'http://localhost:3000/api/login',
        method: 'POST',
        nodes: [],
        messages: [],
      },
    };

    expect(() => constructFlowCsrfToken(flowWithEmptyNodes)).toThrow('Missing csrf_token node');
  });

  it('should find csrf_token among multiple nodes', () => {
    const flow: LoginFlow = {
      id: 'flow-123',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      issued_at: new Date().toISOString(),
      request_url: 'http://localhost:3000',
      type: 'browser',
      ui: {
        action: 'http://localhost:3000/api/login',
        method: 'POST',
        nodes: [
          {
            type: 'input',
            group: 'default',
            attributes: {
              name: 'email',
              type: 'text',
              value: '',
              required: true,
              disabled: false,
              node_type: 'input',
            } as UiNodeInputAttributes,
            messages: [],
            meta: {},
          },
          {
            type: 'input',
            group: 'default',
            attributes: {
              name: 'csrf_token',
              type: 'hidden',
              value: mockCsrfToken,
              required: true,
              disabled: false,
              node_type: 'input',
            } as UiNodeInputAttributes,
            messages: [],
            meta: {},
          },
          {
            type: 'input',
            group: 'default',
            attributes: {
              name: 'password',
              type: 'password',
              value: '',
              required: true,
              disabled: false,
              node_type: 'input',
            } as UiNodeInputAttributes,
            messages: [],
            meta: {},
          },
        ],
        messages: [],
      },
    };

    const result = constructFlowCsrfToken(flow);

    expect(result).toBe(mockCsrfToken);
  });
});

