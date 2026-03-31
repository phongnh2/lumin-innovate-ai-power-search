import { CustomSetupIntentError } from 'utils/customSetupIntentError';

interface RateLimitErrorConfig {
  preMessage: string;
  resource: string;
}

interface RateLimitErrorMap {
  default: RateLimitErrorConfig;
  CreateMyOwnTeam: RateLimitErrorConfig;
  RemoveTeam: RateLimitErrorConfig;
  AddMembersToTeam: RateLimitErrorConfig;
  InviteMembers: RateLimitErrorConfig;
  ChangePassword: RateLimitErrorConfig;
  ForgotPassword: RateLimitErrorConfig;
  EditMyTeam: RateLimitErrorConfig;
  ChangeCardInfo: RateLimitErrorConfig;
  EditUser: RateLimitErrorConfig;
  SignIn: RateLimitErrorConfig;
  SignUp: RateLimitErrorConfig;
  LeaveTeam: RateLimitErrorConfig;
  RemoveMember: RateLimitErrorConfig;
  SetAdmin: RateLimitErrorConfig;
  SetModerator: RateLimitErrorConfig;
  SetMember: RateLimitErrorConfig;
  changeDocumentPermission: RateLimitErrorConfig;
  TransferOwnership: RateLimitErrorConfig;
  requestAccessDocument: RateLimitErrorConfig;
  acceptRequestAccessDocument: RateLimitErrorConfig;
  rejectRequestAccessDocument: RateLimitErrorConfig;
  renameDocument: RateLimitErrorConfig;
  shareDocument: RateLimitErrorConfig;
  updateDocumentPermission: RateLimitErrorConfig;
  removeDocumentPermission: RateLimitErrorConfig;
  starDocument: RateLimitErrorConfig;
  deleteDocument: RateLimitErrorConfig;
  InviteUserToDefaultTeam: RateLimitErrorConfig;
  UpdateSetting: RateLimitErrorConfig;
  UpdatePaymentMethod: RateLimitErrorConfig;
}

interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    statusCode?: number;
    limit?: string | number;
    expire?: string | number;
    remaining?: string | number;
    operationName?: string;
    metadata?: unknown;
  };
}

interface GraphQLErrorContainer {
  graphQLErrors?: GraphQLError[];
  stopped?: boolean;
}

interface AxiosError {
  response?: {
    data?: {
      statusCode?: number;
      message?: string;
      code?: string;
    };
    headers?: {
      [key: string]: string;
    };
  };
  message?: string;
  code?: string;
  metadata?: unknown;
}

interface ExtractedError {
  message: string;
  code: string;
  statusCode: number;
  metadata?: unknown;
  stopped?: boolean;
  isSetupIntentError?: boolean;
}

interface ExpireTimeResult {
  displayTime: string;
  time: number;
}

interface GraphQLOperation {
  operationName?: string;
  getContext(): {
    response: {
      headers: {
        get(name: string): string | null;
      };
    };
  };
}

interface GraphQLResponse {
  errors?: Array<{
    extensions?: {
      [key: string]: unknown;
    };
  }>;
}

interface HandleCommonErrorParams {
  errorCode: string;
  t: (key: string) => string;
}

interface HandleUnknownErrorParams {
  error: unknown;
  messageKey?: string;
  t: (key: string) => string;
}

declare namespace errorUtils {
  function isGraphError(error: unknown): error is GraphQLErrorContainer;

  function getExpireTime(expire: string | number): ExpireTimeResult;

  function extractGqlError(
    err: GraphQLErrorContainer | CustomSetupIntentError | unknown,
    customMessage?: string
  ): ExtractedError;

  function isRateLimitError(error: AxiosError | GraphQLErrorContainer): boolean;

  function constructRateLimitError(error: unknown, message: string): string;

  function attachHeaderToError(operation: GraphQLOperation, response: GraphQLResponse): GraphQLResponse;

  function deriveAxiosGraphToHttpError(graphError: {
    message: string;
    extensions: {
      statusCode: number;
      code: string;
    };
  }): AxiosError;

  function handleCommonError(params: HandleCommonErrorParams): void;

  function handleUnknownError(params: HandleUnknownErrorParams): void;

  function isAbortError(error: unknown): boolean;

  function handleScimBlockedError(err: unknown): boolean;
}

export default errorUtils;
