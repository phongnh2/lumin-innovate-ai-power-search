// ------------------------------ Dev by Lumin -----------------------------
import { produce } from 'immer';
import { merge, mergeWith, isArray } from 'lodash';

import rolloutUtils from 'utils/rolloutUtils';
import validator from 'utils/validator';

import { DEFAULT_DOMAIN_WHITE_LIST } from 'constants/domainWhitelist';

// eslint-disable-next-line default-param-last
export default (initialState) => (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_CURRENT_USER': {
      const { _id: userId, email } = payload.currentUser;
      const isShowRatingViaSync = validator.validateEmailByDomains(email, DEFAULT_DOMAIN_WHITE_LIST) ||
        rolloutUtils.isRateAppViaAutoSync(userId);

      return {
        ...state,
        currentUser: {
          ...payload.currentUser,
          clientId: userId,
          isShowRatingViaSync,
        },
      };
    }
    case 'SET_IS_AUTHENTICATING': {
      return {
        ...state,
        isAuthenticating: payload.isAuthenticating,
      };
    }
    case 'UPDATE_CURRENT_USER': {
      return {
        ...state,
        currentUser: merge({}, state.currentUser, payload.data),
      };
    }
    case 'SET_CURRENT_DOCUMENT':
      return {
        ...state,
        currentDocument: {
          ...state.currentDocument,
          ...payload.document,
        },
      };
    case 'UPDATE_CURRENT_DOCUMENT': {
      if (!state.currentDocument) {
        return state;
      }
      return {
        ...state,
        currentDocument: mergeWith({}, state.currentDocument, payload.data, (objValue, srcValue) => {
          if (isArray(objValue)) {
            return srcValue;
          }
          return undefined;
        }),
      };
    }
    case 'START_FETCHING_CURRENT_DOCUMENT': {
      return {
        ...state,
        isFetchingCurrentDocument: true,
        currentDocument: null,
      };
    }
    case 'FETCHING_CURRENT_DOCUMENT_COMPLETE': {
      return {
        ...state,
        isFetchingCurrentDocument: false,
        currentDocument: payload.currentDocument,
      };
    }
    case 'RESET_CURRENT_DOCUMENT':
      return {
        ...state,
        currentDocument: initialState.currentDocument,
      };
    case 'SET_OWNED_FILTER': {
      return {
        ...state,
        ownedFilter: payload.ownedFilter,
      };
    }
    case 'SET_LAST_MODIFIED_FILTER': {
      return {
        ...state,
        lastModifiedFilter: payload.lastModifiedFilter,
      };
    }
    case 'SIGN_OUT_USER':
      return {
        currentUser: null,
        currentTeam: null,
        currentFolderType: 'individual',
      };
    case 'SET_DELETE_PASSWORD':
      return {
        ...state,
        deletePassword: payload.password,
      };
    case 'SET_SUB_MENU_TYPE': {
      return {
        ...state,
        subMenuType: payload.subMenuType,
      };
    }
    case 'LOAD_GAPI_SUCCESS': {
      return {
        ...state,
        gapiLoaded: true,
      };
    }
    case 'SET_OFFLINE': {
      return {
        ...state,
        isOffline: payload.isOffline,
      };
    }
    case 'SET_SOURCE_DOWNLOADING': {
      return {
        ...state,
        isSourceDownloading: payload.isSourceDownloading,
      };
    }
    case 'UPDATE_NOTIFICATION_STATUS': {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notificationStatus: merge({}, state.currentUser.notificationStatus, payload.notificationStatus),
        }
      };
    }
    case 'UPDATE_LOCATION_CURRENCY': {
      return {
        ...state,
        locationCurrency: {
          value: payload.currency,
          loading: false,
        },
      };
    }
    case 'SET_WRONG_IP_STATUS': {
      return {
        ...state,
        wrongIpStatus: merge({}, state.wrongIpStatus, payload)
      };
    }
    case 'SET_MEMBERSHIP_OF_ORG': {
      return {
        ...state,
        membershipOfOrg: merge({}, state.membershipOfOrg, payload)
      };
    }
    case 'SET_LANGUAGE': {
      return {
        ...state,
        language: payload.language,
      };
    }
    case 'LOAD_USER_LOCATION_SUCCESS': {
      return {
        ...state,
        userLocationLoaded: true,
      };
    }
    case 'SET_USER_SIGN_PAYMENT': {
      return {
        ...state,
        userSignPayment: payload.userSignPayment,
      };
    }
    case 'LOAD_GTM_SUCCESS': {
      return {
        ...state,
        gtmLoaded: true,
      };
    }
    case 'SET_IS_COMPLETED_GETTING_USER_DATA': {
      return {
        ...state,
        isCompletedGettingUserData: payload.isCompletedGettingUserData,
      };
    }
    case 'UPDATE_USER_METADATA': {
      return produce(state, (draft) => {
        draft.currentUser.metadata = { ...draft.currentUser?.metadata, ...payload };
      });
    }
    case 'DELETE_USER_REMOTE_SIGNATURE': {
      return produce(state, (draft) => {
        draft.currentUser.signatures = draft.currentUser.signatures.filter(
          (signature) => signature !== payload.remoteId
        );
      });
    }

    default:
      return state;
  }
};
