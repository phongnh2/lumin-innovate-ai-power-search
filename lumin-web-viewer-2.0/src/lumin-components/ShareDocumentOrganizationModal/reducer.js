import { DocumentRole } from 'constants/documentConstants';

export const initialState = {
  members: [],
  fetchingMemberCursor: undefined,
  hasNextPageMember: false,
  userTags: [],
  pendingUserTags: [],
  shareMessage: '',
  showMessage: false,
  userTagPermission: DocumentRole.SPECTATOR,
  requestAccessList: {
    requesters: [],
    cursor: '',
    totalRequest: 0,
    hasNextPage: false,
    loading: false,
    isFetchingMore: false,
  },
  name: '',
  limitedShareError: '',
  invitedByEmailList: [],
  loading: false,
  isFetchingData: false,
  totalMember: 0,
  currentUserRole: undefined,
  isLoading: true,
};

export const reducer = (state, { type, payload = {} }) => {
  switch (type) {
    case 'UPDATE_FETCHING_MEMBER_CURSOR':
      return { ...state, fetchingMemberCursor: payload.newCursor };
    case 'UPDATE_USER_TAGS':
      return { ...state, userTags: payload.userTags };
    case 'UPDATE_PENDING_USER_TAGS':
      return { ...state, pendingUserTags: payload.pendingUserTags };
    case 'UPDATE_SHARE_MESSAGE':
      return { ...state, shareMessage: payload.shareMessage };
    case 'UPDATE_SHOW_SHARE_MESSAGE':
      return { ...state, showMessage: payload.showMessage };
    case 'UPDATE_USER_TAG_PERMISSION':
      return { ...state, userTagPermission: payload.userTagPermission };
    case 'START_FETCH_REQUEST_ACCESS_LIST':
      return {
        ...state,
        requestAccessList: { ...state.requestAccessList, hasNextPage: true, loading: true, cursor: '' },
      };
    case 'UPDATE_REQUEST_ACCESS_LIST':
      return { ...state, requestAccessList: payload.requestAccessList };
    case 'RESET_SHARE_MODAL_LIST':
      return {
        ...state,
        shareMessage: '',
        showMessage: false,
        pendingUserTags: [],
        userTags: [],
      };
    case 'SET_NAME':
      return { ...state, name: payload.name };
    case 'SET_LIMITED_SHARE_ERROR':
      return { ...state, limitedShareError: payload.limitedShareError };
    case 'UPDATE_INVITED_BY_EMAIL_LIST':
      return { ...state, invitedByEmailList: payload.invitedByEmailList };
    case 'UPDATE_MEMBERS':
      return { ...state, members: payload.members };
    case 'UPDATE_MEMBERS_LIST_INFO':
      return {
        ...state,
        members: payload.members,
        totalMember: payload.totalMember,
        currentUserRole: payload.currentUserRole,
        fetchingMemberCursor: payload.cursor,
        hasNextPageMember: payload.hasNextPage,
      };
    case 'LOADING_ADD_MEMBER':
      return { ...state, loading: payload.loading };
    case 'SET_IS_FETCHING':
      return { ...state, isFetchingData: payload.isFetchingData };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: payload.isLoading };
    default:
      return state;
  }
};
