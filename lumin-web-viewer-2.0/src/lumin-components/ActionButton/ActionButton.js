import { connect } from 'react-redux';

import Button from 'lumin-components/ViewerCommon/ButtonLumin';

const mapStateToProps = (state, ownProps) => ({
  className: `ActionButton ${ownProps.className || ''}`,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => {
    ownProps.onClick(dispatch);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Button);
