/* eslint-disable sonarjs/no-duplicate-string */
import { openPermissionChangedModal } from 'utils/openPermissionChangedModal';
import toastUtils from 'utils/toastUtils';

import { DefaultErrorCode, ErrorCode, ErrorIgnoreToast } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';

import { CustomSetupIntentError } from './customSetupIntentError';

const RateLimitError = {
  default: {
    preMessage: 'You have requested',
    resource: 'times',
  },
  CreateMyOwnTeam: {
    preMessage: 'You have created',
    resource: 'teams',
  },
  RemoveTeam: {
    preMessage: 'You have removed',
    resource: 'teams',
  },
  AddMembersToTeam: {
    preMessage: 'You have added',
    resource: 'members',
  },
  InviteMembers: {
    preMessage: 'You have invited',
    resource: 'users',
  },
  ChangePassword: {
    preMessage: 'You have changed password',
    resource: 'times',
  },
  ForgotPassword: {
    preMessage: 'You have used forgot password',
    resource: 'times',
  },
  EditMyTeam: {
    preMessage: 'You have edited team',
    resource: 'times',
  },
  ChangeCardInfo: {
    preMessage: 'You have update card',
    resource: 'times',
  },
  EditUser: {
    preMessage: 'You have edited',
    resource: 'times',
  },
  SignIn: {
    preMessage: 'You have signed in',
    resource: 'times',
  },
  SignUp: {
    preMessage: 'You have signed up',
    resource: 'times',
  },
  LeaveTeam: {
    preMessage: 'You have left',
    resource: 'teams',
  },
  RemoveMember: {
    preMessage: 'You have removed',
    resource: 'members',
  },
  SetAdmin: {
    preMessage: 'You have set',
    resource: 'admins',
  },
  SetModerator: {
    preMessage: 'You have set',
    resource: 'moderators',
  },
  SetMember: {
    preMessage: 'You have set',
    resource: 'members',
  },
  changeDocumentPermission: {
    preMessage: 'You have move',
    resource: 'documents',
  },
  TransferOwnership: {
    preMessage: 'You have transfered',
    resource: 'teams',
  },
  requestAccessDocument: {
    preMessage: 'You have requested access to',
    resource: 'documents',
  },
  acceptRequestAccessDocument: {
    preMessage: 'You have accepted access to',
    resource: 'documents',
  },
  rejectRequestAccessDocument: {
    preMessage: 'You have rejected access to',
    resource: 'documents',
  },
  renameDocument: {
    preMessage: 'You have renamed documents',
    resource: 'times',
  },
  shareDocument: {
    preMessage: 'You have shared',
    resource: 'documents',
  },
  updateDocumentPermission: {
    preMessage: 'You have requested',
    resource: 'times',
  },
  removeDocumentPermission: {
    preMessage: 'You have requested',
    resource: 'times',
  },
  starDocument: {
    preMessage: 'You have stared/unstared',
    resource: 'documents',
  },
  deleteDocument: {
    preMessage: 'You have deleted',
    resource: 'documents',
  },
  InviteUserToDefaultTeam: {
    preMessage: 'You have invited',
    resource: 'members',
  },
  UpdateSetting: {
    preMessage: 'You have updated',
    resource: 'times',
  },
  UpdatePaymentMethod: {
    preMessage: 'You have update payment method',
    resource: 'times',
  },
};

function isGraphError(error) {
  return error && error.graphQLErrors && error.graphQLErrors.length > 0;
}

function getExpireTime(expire) {
  const minutes = Math.ceil(expire / 60);
  const displayTime = minutes > 60 ? 'hours' : 'minutues';
  const time = minutes > 60 ? Math.ceil(minutes / 60) : minutes;
  return { displayTime, time };
}

function extractGqlError(err, customMessage) {
  if (isGraphError(err)) {
    const { stopped } = err.graphQLErrors;
    const { message } = err.graphQLErrors[0];
    const { code, statusCode, limit, expire, remaining, operationName, metadata } = err.graphQLErrors[0].extensions || {
      code: 'UNKNOWN_ERROR',
      statusCode: 520,
    };
    let msg = message;
    if (Number(remaining) === -1) {
      const { preMessage, resource } = RateLimitError[operationName] || RateLimitError.default;
      const { displayTime, time } = getExpireTime(expire);
      msg = `${preMessage} ${limit} ${resource}. Please retry after ${time} ${displayTime}.`;
    }
    return {
      message: msg,
      code,
      statusCode,
      metadata,
      stopped,
    };
  }
  if (err instanceof CustomSetupIntentError) {
    return {
      message: err.message,
      code: err.name,
      statusCode: 402,
      isSetupIntentError: true,
    };
  }
  return {
    message: customMessage || err?.message || 'Unknown error',
    code: err?.code ?? 'UNKNOWN_ERROR',
    statusCode: 520,
    metadata: err?.metadata,
  };
}
function isRateLimitError(error) {
  const hasHttpError = error.response && error.response.data && error.response.data.statusCode === 429;
  const { code } = extractGqlError(error);
  const hasGraphError = isGraphError(error) && code === DefaultErrorCode.TOO_MANY_REQUESTS;
  return hasHttpError || hasGraphError;
}

function constructRateLimitError(error, message) {
  let msg = message;
  if (isRateLimitError(error)) {
    const limit = error.response.headers['x-ratelimit-limit'];
    const expire = error.response.headers['x-retry-after'];
    const remaining = error.response.headers['x-ratelimit-remaining'];
    if (Number(remaining) === -1) {
      const { displayTime, time } = getExpireTime(expire);
      msg = `${error.preMessage} ${limit} ${error.resource}. Please retry after ${time} ${displayTime}`;
    }
  }
  msg = extractGqlError(error, msg).message;
  return msg;
}

function attachHeaderToError(operation, response) {
  const { headers } = operation.getContext().response;
  const limit = headers.get('X-RateLimit-Limit');
  const expire = headers.get('X-Retry-After');
  const remaining = headers.get('X-Ratelimit-Remaining');
  const res = response;
  if (res.errors && res.errors[0] && limit && expire) {
    res.errors[0].extensions = {
      ...res.errors[0].extensions,
      limit,
      expire,
      remaining,
      operationName: operation.operationName,
    };
  }
  return res;
}

function deriveAxiosGraphToHttpError({ message, extensions }) {
  const httpError = new Error(message);
  httpError.response = { data: { statusCode: extensions.statusCode, message, code: extensions.code } };
  return httpError;
}

function handleCommonError({ errorCode, t }) {
  if ([ErrorCode.Common.NOT_FOUND, ErrorCode.Common.NO_PERMISSION].includes(errorCode)) {
    openPermissionChangedModal({ closable: false, t });
  }
}

function handleUnknownError({ error, messageKey = '', t }) {
  const { code: errorCode } = extractGqlError(error);
  if (!Object.values(ErrorIgnoreToast).includes(errorCode.toLowerCase())) {
    toastUtils.openToastMulti({
      message: t(messageKey || 'common.somethingWentWrong'),
      type: ModalTypes.Error,
    });
  }
}

function isAbortError(error) {
  const extractedError = extractGqlError(error);
  return extractedError?.message === 'signal is aborted without reason' || extractedError?.code === 'ERR_CANCELED';
}

function handleScimBlockedError(err) {
  const { code } = extractGqlError(err);
  if (code === ErrorCode.Org.ACTION_BLOCKED_BY_SCIM) {
    toastUtils.openScimBlockedErrorToast().finally(() => {});
    return true;
  }
  return false;
}

export default {
  extractGqlError,
  constructRateLimitError,
  attachHeaderToError,
  isRateLimitError,
  deriveAxiosGraphToHttpError,
  isGraphError,
  handleCommonError,
  handleUnknownError,
  isAbortError,
  handleScimBlockedError,
};
