import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import SearchOverlay from './SearchOverlay';

const mapStateToProps = (state) => ({
  searchValue: selectors.getSearchValue(state),
  isCaseSensitive: selectors.isCaseSensitive(state),
  isWholeWord: selectors.isWholeWord(state),
  isRegex: selectors.isRegex(state),
  searchListeners: selectors.getSearchListeners(state),
  isSearchUp: selectors.isSearchUp(state),
  isProgrammaticSearch: selectors.isProgrammaticSearch(state),
  activeResult: selectors.getActiveResult(state),
  isWildcard: selectors.isWildcard(state),
  isAmbientString: selectors.isAmbientString(state),
  isPageEditMode: selectors.isPageEditMode(state),
  results: selectors.getResults(state),
  activeResultIndex: selectors.getActiveResultIndex(state),
  isProgrammaticSearchFull: selectors.isProgrammaticSearchFull(state),
  isOpenSearchOverlay: selectors.isOpenSearchOverlay(state),
  isShowTopBar: selectors.getIsShowTopBar(state),
  rightPanelValue: selectors.rightPanelValue(state),
  isRightPanelOpen: selectors.isRightPanelOpen(state),
  isToolPropertiesOpen: selectors.isToolPropertiesOpen(state),
});

const mapDispatchToProps = {
  setActiveResult: actions.setActiveResult,
  setSearchValue: actions.setSearchValue,
  setActiveResultIndex: actions.setActiveResultIndex,
  setIsSearching: actions.setIsSearching,
  setWholeWord: actions.setWholeWord,
  addResults: actions.addResults,
  setCaseSensitive: actions.setCaseSensitive,
  setSearchError: actions.setSearchError,
  resetSearch: actions.resetSearch,
  setNoResult: actions.setNoResult,
  setIsProgrammaticSearch: actions.setIsProgrammaticSearch,
  setIsProgrammaticSearchFull: actions.setIsProgrammaticSearchFull,
  setSearchOverlayValue: (args) => actions.setSearchOverlayValue(args),
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation())(SearchOverlay);
