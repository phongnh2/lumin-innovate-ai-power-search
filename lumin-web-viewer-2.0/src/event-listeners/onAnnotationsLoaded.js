import actions from 'actions';

export default (dispatch) => () => {
  dispatch(actions.setAnnotationsLoaded(true));
};
