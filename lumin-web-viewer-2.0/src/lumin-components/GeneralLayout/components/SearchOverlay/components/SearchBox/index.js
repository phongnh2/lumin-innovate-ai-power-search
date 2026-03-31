import { connect } from 'react-redux';

import selectors from 'selectors';

import { LayoutElements } from 'lumin-components/GeneralLayout/constants';

import SearchBox from './SearchBox';

const mapStateToProps = (state) => ({
  isSearchPanelOpen:
    selectors.isRightPanelOpen(state) && selectors.rightPanelValue(state) === LayoutElements.SEARCH,
});
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SearchBox);
