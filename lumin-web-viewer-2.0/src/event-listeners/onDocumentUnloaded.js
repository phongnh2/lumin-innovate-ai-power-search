import actions from 'actions';

export default (dispatch) => () => {
  dispatch(actions.closeElements(['pageNavOverlay', 'notesPanel', 'searchPanel', 'leftPanel']));
  dispatch(actions.setOutlines({
    children: [],
    model: {
      children: [],
    },
  }));
  dispatch(actions.setTotalPages(0));
};
