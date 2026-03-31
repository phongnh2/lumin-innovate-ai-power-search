import { connect } from 'react-redux';

import withRouter from 'HOC/withRouter';

import PersonalDashboardInsights from './PersonalDashboardInsights';

const mapDispatchToProps = () => ({
});

export default connect(null, mapDispatchToProps)(withRouter(PersonalDashboardInsights));
