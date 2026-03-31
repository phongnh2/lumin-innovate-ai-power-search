import { connect } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import withRouter from 'HOC/withRouter';

import PopperLimitWrapper from './PopperLimitWrapper';

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
  themeMode: selectors.getThemeMode(state),
  organizations: selectors.getOrganizationList(state),
});

export default compose(connect(mapStateToProps), withRouter)(PopperLimitWrapper);
