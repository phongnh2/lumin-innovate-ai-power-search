import { merge } from 'lodash';

export default (initialState) =>
  // eslint-disable-next-line default-param-last
  (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
      case 'SET_USER_NAME':
        return { ...state, name: payload.userName };
      case 'SET_ADMIN_USER':
        return { ...state, isAdmin: payload.isAdminUser };
      case 'DISABLE_PWA_DOWNLOAD_BANNER': {
        return { ...state, disablePwaDownload: true };
      }
      case 'ENABLE_PWA_DOWNLOAD_BANNER': {
        return { ...state, disablePwaDownload: false };
      }
      case 'SET_USER_SIGNATURES': {
        return { ...state, userSignatures: [...payload.userSignatures] };
      }
      case 'ADD_USER_SIGNATURES': {
        return { ...state, userSignatures: [...payload.newSignatures, ...state.userSignatures] };
      }
      case 'UPDATE_USER_SIGNATURES': {
        return { ...state, userSignatures: [...state.userSignatures, ...payload.updatedSignatures] };
      }
      case 'UPDATE_SIGNATURE_BY_ID': {
        return {
          ...state,
          userSignatures: state.userSignatures.map((signature) =>
            signature.id === payload.id ? merge({}, signature, payload.signature) : signature
          ),
        };
      }

      case 'REORDER_USER_SIGNATURES': {
        const currentSignature = state.userSignatures.splice(payload.fromIndex, 1)[0];
        state.userSignatures.splice(payload.toIndex, 0, currentSignature);
        return {
          ...state,
          userSignatures: [...state.userSignatures],
        };
      }
      case 'DELETE_USER_REMOTE_SIGNATURE': {
        return {
          ...state,
          userSignatures: state.userSignatures.filter((signature) => signature.remoteId !== payload.remoteId),
        };
      }
      default:
        return state;
    }
  };
