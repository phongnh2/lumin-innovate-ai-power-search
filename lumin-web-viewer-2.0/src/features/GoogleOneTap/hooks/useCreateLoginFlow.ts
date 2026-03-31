import { LoginFlow, UiNodeInputAttributes } from '@ory/kratos-client';
import { AxiosError } from 'axios';
import { useCallback } from 'react';

import { kratosService } from 'services/oryServices';

interface IUseCreateLoginFlowProps {
  returnTo?: string;
  refresh?: boolean;
  initial?: LoginFlow;
}

interface IKratosErrorResponse {
  error: {
    id: string;
    status: number;
  };
}

const SESSION_ALREADY_AVAILABLE = 'session_already_available';

const isSessionAlreadyAvailableError = (error: unknown): error is AxiosError<IKratosErrorResponse> => {
  const axiosError = error as AxiosError<IKratosErrorResponse>;
  return axiosError?.response?.data?.error?.id === SESSION_ALREADY_AVAILABLE;
};

const isFlowExpired = (flow: LoginFlow): boolean => new Date(flow.expires_at) <= new Date();

export const constructFlowCsrfToken = (flow: LoginFlow): string => {
  const { nodes } = flow.ui;
  const foundNode = nodes.find((node) => 'name' in node.attributes && node.attributes.name === 'csrf_token');

  if (!foundNode) {
    throw new Error('Missing csrf_token node');
  }

  return (foundNode.attributes as UiNodeInputAttributes).value as string;
};

type LoginFlowResult =
  | { data: LoginFlow; error?: never }
  | { error: { status: number | undefined; data: null }; data?: never };

export const useCreateLoginFlow = (props: IUseCreateLoginFlowProps) => {
  const { initial, returnTo, refresh } = props;

  const createLoginFlow = useCallback(async (): Promise<LoginFlowResult> => {
    const canReuseInitialFlow = initial && !refresh && !isFlowExpired(initial);
    if (canReuseInitialFlow) {
      return { data: initial };
    }

    try {
      const flow = await kratosService.createBrowserLoginFlow({ returnTo, refresh });
      return { data: flow };
    } catch (error) {
      if (isSessionAlreadyAvailableError(error)) {
        window.location.reload();
      }
      throw error;
    }
  }, [initial, refresh, returnTo]);

  return [createLoginFlow] as const;
};
