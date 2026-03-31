import { connect } from 'react-redux';

import ButtonLumin from 'lumin-components/ViewerCommon/ButtonLumin';

const mapStateToProps = (state, ownProps) => ({
  className: `ViewerActionButton ${ownProps.className || ''}`,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => {
    ownProps.onClick(dispatch);
  },
});

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ButtonLumin);
