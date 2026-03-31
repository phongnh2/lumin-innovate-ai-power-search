import { connect } from 'react-redux';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import actions from 'actions';
import selectors from 'selectors';
import SearchOverlay from './SearchOverlay';

const mapStateToProps = (state) => ({
  isSearchPanelOpen: selectors.isElementOpen(state, 'searchPanel'),
  isSearchPanelDisabled: selectors.isElementDisabled(state, 'searchPanel'),
  isWildCardSearchDisabled: selectors.isElementDisabled(
    state,
    'wildCardSearchOption',
  ),
  searchValue: selectors.getSearchValue(state),
  isCaseSensitive: selectors.isCaseSensitive(state),
  isWholeWord: selectors.isWholeWord(state),
  isAmbientString: selectors.isAmbientString(state),
  isSearchUp: selectors.isSearchUp(state),
  isWildcard: selectors.isWildcard(state),
  isRegex: selectors.isRegex(state),
  results: selectors.getResults(state),
  activeResult: selectors.getActiveResult(state),
  activeResultIndex: selectors.getActiveResultIndex(state),
  isProgrammaticSearch: selectors.isProgrammaticSearch(state),
  isProgrammaticSearchFull: selectors.isProgrammaticSearchFull(state),
  searchListeners: selectors.getSearchListeners(state),
  isDisabled: selectors.isElementDisabled(state, 'searchOverlay'),
  isShowTopBar: selectors.getIsShowTopBar(state),
  isPageEditMode: selectors.isPageEditMode(state),
  themeMode: selectors.getThemeMode(state),
});

const mapDispatchToProps = {
  openElement: actions.openElement,
  openElements: actions.openElements,
  closeElement: actions.closeElement,
  closeElements: actions.closeElements,
  setSearchValue: actions.setSearchValue,
  setActiveResult: actions.setActiveResult,
  setActiveResultIndex: actions.setActiveResultIndex,
  setIsSearching: actions.setIsSearching,
  resetSearch: actions.resetSearch,
  addResults: actions.addResults,
  setCaseSensitive: actions.setCaseSensitive,
  setWholeWord: actions.setWholeWord,
  setNoResult: actions.setNoResult,
  setSearchError: actions.setSearchError,
  setIsProgrammaticSearch: actions.setIsProgrammaticSearch,
  setIsProgrammaticSearchFull: actions.setIsProgrammaticSearchFull,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
)(SearchOverlay);
