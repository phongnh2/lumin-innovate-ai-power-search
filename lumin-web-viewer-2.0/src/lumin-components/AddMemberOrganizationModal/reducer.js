export const initialState = {
  popperShow: false,
  members: [],
  searchState: {
    isSearching: false,
    isShowSearchPopper: false,
    searchValue: null,
    activeSuggestion: false,
  },
  selectedMember: {},
  anchorEl: null,
  showRequestToPay: false,
};

export const reducer = (state, { type, payload = { } }) => {
  switch (type) {
    case 'SET_MEMBERS':
      return { ...state, members: payload.newMembers };
    case 'UPDATE_POPPER_SHOW':
      return { ...state, popperShow: payload.newState };
    case 'UPDATE_SELECTED_MEMBER':
      return { ...state, selectedMember: payload.selectedMember };
    case 'UPDATE_STATE_WHEN_CLICKED_USER_ROLE':
      return {
        ...state,
        popperShow: true,
        selectedMember: payload.selectedMember,
        anchorEl: payload.anchorEl,
      };
    case 'TOGGLE_REQUEST_TO_PAY':
      return { ...state, showRequestToPay: payload.showRequestToPay };
    default:
      return state;
  }
};
