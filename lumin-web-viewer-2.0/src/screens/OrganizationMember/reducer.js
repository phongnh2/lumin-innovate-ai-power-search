import { ORGANIZATION_MEMBER_TYPE } from 'constants/organizationConstants';

export const initialState = {
  listToShow: ORGANIZATION_MEMBER_TYPE.MEMBER,
  isOpenAddDialog: false,
  isOpenInfoDialog: false,
  isOpenEditDialog: false,
  inputText: '',
  searchText: '',
  totalPendingMembers: null,
  isChangedFilterListToShow: false,
  totalMembers: 0,

};

export const reducer = (state, { type, payload = { } }) => {
  switch (type) {
    case 'UPDATE_TOTAL_PENDING_MEMBERS':
      return { ...state, totalPendingMembers: payload.totalPendingMembers };
    case 'UPDATE_INPUT_TEXT':
      return { ...state, inputText: payload.newText };
    case 'UPDATE_SEARCH_TEXT':
      return { ...state, searchText: payload.newText };
    case 'CLEAR_SEARCH':
      return { ...state, inputText: '', searchText: '' };
    case 'TOGGLE_ADD_DIALOG':
      return { ...state, isOpenAddDialog: payload.isOpenAddDialog };
    case 'TOGGLE_ORG_INFO_DIALOG':
      return { ...state, isOpenInfoDialog: payload.isOpenOrgInfoDialog };
    case 'TOGGLE_ORG_EDIT_DIALOG':
      return { ...state, isOpenEditDialog: payload.isOpenEditDialog };
    case 'CHANGE_LIST_TO_SHOW':
      return { ...state, listToShow: payload.listToShow };
    case 'UPDATE_STATE_IS_CHANGED_FILTER_LIST_TO_SHOW':
      return { ...state, isChangedFilterListToShow: payload.newState };
    case 'UPDATE_TOTAL_MEMBERS':
      return { ...state, totalMembers: payload.totalMembers };
    default:
      return state;
  }
};
