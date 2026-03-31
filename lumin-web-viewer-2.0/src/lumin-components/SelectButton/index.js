import selectors from 'selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import SelectButton from './SelectButton';

const mapStateToProps = (state, ownProps) => ({
  isActive: selectors.getActiveToolName(state) === ownProps.toolName,
  isInContentEditMode: selectors.isInContentEditMode(state),
});

export default compose(connect(mapStateToProps), withTranslation())(SelectButton);
