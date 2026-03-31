/* eslint-disable no-bitwise */
/* eslint-disable class-methods-use-this */
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import React from 'react';

import SearchBox from '@new-ui/components/SearchOverlay/components/SearchBox';
import { LayoutElements } from '@new-ui/constants';
import Checkbox from '@new-ui/general-components/Checkbox';

import core from 'core';

import ClickAwayListener from 'lumin-components/Shared/ClickAwayListener';

import fireEvent from 'helpers/fireEvent';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { CUSTOM_EVENT } from 'constants/customEvent';
import toolsName from 'constants/toolsName';

import KeyEventProvider from './KeyEventProvider';

import * as Styled from './SearchOverlay.styled';

const propTypes = {
  isSearchPanelDisabled: PropTypes.bool,
  searchValue: PropTypes.string,
  isCaseSensitive: PropTypes.bool,
  isWholeWord: PropTypes.bool,
  isSearchUp: PropTypes.bool,
  isAmbientString: PropTypes.bool,
  isWildcard: PropTypes.bool,
  isRegex: PropTypes.bool,
  results: PropTypes.arrayOf(PropTypes.object),
  activeResult: PropTypes.object,
  activeResultIndex: PropTypes.number,
  isProgrammaticSearch: PropTypes.bool,
  searchListeners: PropTypes.arrayOf(PropTypes.func),
  setNoResult: PropTypes.func.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  setActiveResult: PropTypes.func.isRequired,
  setActiveResultIndex: PropTypes.func.isRequired,
  addResults: PropTypes.func.isRequired,
  setCaseSensitive: PropTypes.func.isRequired,
  resetSearch: PropTypes.func.isRequired,
  setWholeWord: PropTypes.func.isRequired,
  setIsSearching: PropTypes.func.isRequired,
  isProgrammaticSearchFull: PropTypes.bool,
  setIsProgrammaticSearch: PropTypes.func.isRequired,
  setIsProgrammaticSearchFull: PropTypes.func.isRequired,
  t: PropTypes.func,
  setSearchError: PropTypes.func.isRequired,
  isRightPanelOpen: PropTypes.bool,
  isOpenSearchOverlay: PropTypes.bool,
  rightPanelValue: PropTypes.string,
};

const defaultProps = {
  isSearchPanelDisabled: false,
  searchValue: '',
  isCaseSensitive: false,
  isWholeWord: false,
  isSearchUp: false,
  isAmbientString: false,
  isWildcard: false,
  isRegex: false,
  results: [],
  activeResult: {},
  activeResultIndex: -1,
  isProgrammaticSearch: false,
  isProgrammaticSearchFull: false,
  searchListeners: [],
  t: () => {},
  isRightPanelOpen: false,
  isOpenSearchOverlay: false,
  rightPanelValue: LayoutElements.DEFAULT,
};

const THROTTLE_TIME = 200;
class SearchOverlay extends React.PureComponent {
  constructor() {
    super();
    this.caseSensitiveInput = React.createRef();
    this.searchTextInput = React.createRef();
    this.wholeWordInput = React.createRef();
    this.wildcardInput = React.createRef();
    this.executeDebouncedFullSearch = debounce(this.executeFullSearch, 300);
  }

  componentDidMount() {
    // re-open search panel with the search value before
    const isReopenSearchPanel = this.props.searchValue !== '' && this.props.results.length === 0;

    if (isReopenSearchPanel) {
      this.executeFullSearch();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isProgrammaticSearch) {
      this.clearSearchResults();
      this.executeSingleSearch();
      this.props.setIsProgrammaticSearch(false);
    } else if (this.props.isProgrammaticSearchFull) {
      this.caseSensitiveInput.current.checked = this.props.isCaseSensitive;
      this.wholeWordInput.current.checked = this.props.isWholeWord;
      if (this.wildcardInput.current) {
        this.wildcardInput.current.checked = this.props.isWildcard;
      }
      this.clearSearchResults();
      this.executeFullSearch();
      this.props.setIsProgrammaticSearchFull(false);
    }

    const searchPanelOpened =
      (prevProps.rightPanelValue !== LayoutElements.SEARCH || !prevProps.isRightPanelOpen) &&
      this.props.rightPanelValue === LayoutElements.SEARCH &&
      this.props.isRightPanelOpen;

    if ((searchPanelOpened && this.props.searchValue.trim()) || this.props.searchValue !== prevProps.searchValue) {
      this.clearSearchResults();
      this.executeDebouncedFullSearch();
    }

    const searchPanelClosed =
      prevProps.rightPanelValue === LayoutElements.SEARCH &&
      prevProps.isRightPanelOpen &&
      (this.props.rightPanelValue !== LayoutElements.SEARCH || !this.props.rightPanelValue);
    if (searchPanelClosed) {
      this.clearSearchResults();
    }
  }

  handleSearchError = (error) => {
    const { setIsSearching, setSearchError } = this.props;
    setIsSearching(false);
    if (error && error.message) {
      setSearchError(error.message);
    }
  };

  clearSearchResults = () => {
    core.clearSearchResults();
    this.props.resetSearch();
  };

  executeFullSearch = () => {
    const { searchValue, addResults, setIsSearching, setNoResult, setActiveResultIndex } = this.props;
    const isFullSearch = true;
    const searchMode = this.getSearchMode(isFullSearch);
    let tempResults = [];
    let noResult = true;

    const throttleHandleResult = throttle(
      () => {
        core.docViewer.displayAdditionalSearchResults(tempResults);
        addResults([...tempResults]);
        tempResults = [];
      },
      THROTTLE_TIME,
      { leading: false }
    );

    const handleSearchResult = (result) => {
      const foundResult = result.resultCode === core.CoreControls.Search.ResultCode.FOUND;
      if (foundResult) {
        tempResults.push(result);
        throttleHandleResult();
        noResult = false;
      }
    };

    setIsSearching(true);
    const options = {
      fullSearch: isFullSearch,
      onResult: handleSearchResult,
      onDocumentEnd: () => {
        setIsSearching(false);
        setNoResult(noResult);
        this.runSearchListeners();
        const expectedSearch = this.getExpectedSearchResult(tempResults);
        if (expectedSearch) {
          setActiveResultIndex(expectedSearch.index);
          core.setActiveSearchResult(expectedSearch.result);
        }
      },
      onError: this.handleSearchError.bind(this),
    };

    core.textSearchInit(searchValue, searchMode, options);
  };

  getExpectedSearchResult = (searchResults) => {
    if (!searchResults || searchResults.length === 0) return null;
    const currentPage = core.getCurrentPage();

    const isCloserToCurrentPage = (candidate, reference) => {
      const candidateDistance = Math.abs(candidate.pageNum - currentPage);
      const referenceDistance = Math.abs(reference.pageNum - currentPage);
      /**
       * Find the search result closest to the current page
       * If multiple results have the same distance, prefer the one with higher page number
       */
      return (
        candidateDistance < referenceDistance ||
        (candidateDistance === referenceDistance && candidate.pageNum > reference.pageNum)
      );
    };

    return searchResults.reduce(
      (previous, current, index) => {
        if (isCloserToCurrentPage(current, previous.result)) {
          return { result: current, index };
        }
        return previous;
      },
      { result: searchResults[0], index: 0 }
    );
  };

  getSearchMode = (isFull = false) => {
    const { CASE_SENSITIVE, WHOLE_WORD, WILD_CARD, REGEX, PAGE_STOP, HIGHLIGHT, SEARCH_UP, AMBIENT_STRING } =
      core.getSearchMode();
    let searchMode = PAGE_STOP | HIGHLIGHT;
    const { isCaseSensitive, isWholeWord, isWildcard, isRegex, isSearchUp, isAmbientString } = this.props;

    if (isWholeWord) {
      searchMode |= WHOLE_WORD;
    }
    if (isCaseSensitive) {
      searchMode |= CASE_SENSITIVE;
    }
    if (isRegex) {
      searchMode |= REGEX;
    }
    if (isWildcard) {
      searchMode |= WILD_CARD;
    }
    if (isAmbientString || isFull) {
      searchMode |= AMBIENT_STRING;
    }
    if (isSearchUp && !isFull) {
      searchMode |= SEARCH_UP;
    }

    return searchMode;
  };

  runSearchListeners = () => {
    const {
      searchValue,
      searchListeners,
      isCaseSensitive,
      isWholeWord,
      isWildcard,
      isRegex,
      isAmbientString,
      isSearchUp,
      results,
    } = this.props;

    searchListeners.forEach((listener) => {
      listener(
        searchValue,
        {
          caseSensitive: isCaseSensitive,
          wholeWord: isWholeWord,
          wildcard: isWildcard,
          regex: isRegex,
          searchUp: isSearchUp,
          ambientString: isAmbientString,
        },
        results
      );
    });
  };

  onChange = (e) => {
    const { setSearchValue } = this.props;
    const searchValue = e.target.value;

    setSearchValue(searchValue);

    if (searchValue.trim()) {
      this.clearSearchResults();
      this.executeDebouncedFullSearch();
    } else {
      this.clearSearchResults();
    }
  };

  onKeyDown = (e) => {
    const shouldOpenSearchPanel = !this.props.isSearchPanelDisabled && (e.metaKey || e.ctrlKey) && e.which === 13;

    if (e.shiftKey && e.which === 13) {
      // Shift + Enter
      this.onClickPrevious(e);
    } else if (shouldOpenSearchPanel) {
      // (Cmd/Ctrl + Enter)
      this.onClickOverflow(e);
    } else if (e.which === 13) {
      // Enter
      this.onClickNext(e);
    }
  };

  onClickNext = (e) => {
    e.preventDefault();
    const { activeResultIndex, results, setActiveResultIndex } = this.props;
    if (results.length === 0) {
      return;
    }
    const nextResultIndex = activeResultIndex === results.length - 1 ? 0 : activeResultIndex + 1;
    setActiveResultIndex(nextResultIndex);
    core.setActiveSearchResult(results[nextResultIndex]);
  };

  onClickPrevious = (e) => {
    e.preventDefault();
    const { activeResultIndex, results, setActiveResultIndex } = this.props;
    if (results.length === 0) {
      return;
    }
    const prevResultIndex = activeResultIndex <= 0 ? results.length - 1 : activeResultIndex - 1;
    setActiveResultIndex(prevResultIndex);
    core.setActiveSearchResult(results[prevResultIndex]);
  };

  onClickOverflow = () => {
    const { activeResult, setActiveResult } = this.props;
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.SEARCH,
      isOpen: true,
    });
    this.clearSearchResults();
    setActiveResult(activeResult);
    this.executeFullSearch();
  };

  onChangeCaseSensitive = (e) => {
    this.props.setCaseSensitive(e.target.checked);
    this.clearSearchResults();
    this.executeDebouncedFullSearch();
  };

  onChangeWholeWord = (e) => {
    this.props.setWholeWord(e.target.checked);
    this.clearSearchResults();
    this.executeDebouncedFullSearch();
  };

  onClickAway = () => {
    if (this.isSearchPanelOpen()) {
      return;
    }
    this.clearSearchResults();
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.SEARCH_OVERLAY,
      isOpen: false,
    });
  };

  isSearchPanelOpen = () => this.props.rightPanelValue === LayoutElements.SEARCH && this.props.isRightPanelOpen;

  render() {
    const { isOpenSearchOverlay, results, searchValue, activeResultIndex, t } = this.props;

    if (!isOpenSearchOverlay) {
      return null;
    }

    return (
      <ClickAwayListener onClickAway={this.onClickAway}>
        <Styled.Wrapper $isSearchPanelOpen={this.isSearchPanelOpen()}>
          <KeyEventProvider close={this.onClickAway}>
            <Styled.QuickSearch $isSearchPanelOpen={this.isSearchPanelOpen()}>
              <SearchBox
                searchTextInput={this.searchTextInput}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                searchValue={searchValue}
                activeResultIndex={activeResultIndex}
                onClickPrevious={this.onClickPrevious}
                onClickNext={this.onClickNext}
                onClickOverflow={this.onClickOverflow}
                results={results}
              />
            </Styled.QuickSearch>
            {this.isSearchPanelOpen() && (
              <Styled.CheckBoxWrapper>
                <Styled.FormControlLabelWrapper
                  control={
                    <Checkbox
                      id="case-sensitive-option"
                      type="checkbox"
                      onChange={this.onChangeCaseSensitive}
                      onClick={handlePromptCallback({ callback: () => {}, applyForTool: toolsName.REDACTION })}
                      ref={this.caseSensitiveInput}
                    />
                  }
                  label={t('option.searchPanel.caseSensitive')}
                />
                <Styled.FormControlLabelWrapper
                  control={
                    <Checkbox
                      id="whole-word-option"
                      type="checkbox"
                      onChange={this.onChangeWholeWord}
                      onClick={handlePromptCallback({ callback: () => {}, applyForTool: toolsName.REDACTION })}
                      ref={this.wholeWordInput}
                    />
                  }
                  label={t('option.searchPanel.wholeWordOnly')}
                />
              </Styled.CheckBoxWrapper>
            )}
          </KeyEventProvider>
        </Styled.Wrapper>
      </ClickAwayListener>
    );
  }
}

SearchOverlay.defaultProps = defaultProps;
SearchOverlay.propTypes = propTypes;

export default SearchOverlay;
