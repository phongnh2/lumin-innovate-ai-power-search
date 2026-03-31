export const initialState = {
  popperShowMember: false,
  selectedMember: {},
  anchorMemberEl: false,
  requestLoading: false,

};

export const reducer = (state, { type, payload = { } }) => {
  switch (type) {
    case 'UPDATE_POPPER_SHOW_MEMBER': {
      return { ...state, popperShowMember: payload.popperShowMember };
    }
    case 'UPDATE_SELECTED_MEMBER': {
      return { ...state, selectedMember: payload.newSelectedMember };
    }
    case 'UPDATE_STATE_WHEN_CLICKED_DOCUMENT_MEMBER_ROLE':
      return {
        ...state,
        popperShowMember: payload.newStatePopperShow,
        selectedMember: payload.selectedMember,
        anchorMemberEl: payload.anchorMemberEl,
      };
    default:
      return state;
  }
};
