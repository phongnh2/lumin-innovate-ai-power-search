/* eslint-disable no-bitwise */
/* eslint-disable camelcase */
import FormControlLabel from '@mui/material/FormControlLabel';
import { withStyles } from '@mui/styles';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import core from 'core';

import Icomoon from 'luminComponents/Icomoon';
import Tooltip from 'luminComponents/Tooltip';
import Checkbox from 'luminComponents/ViewerCommon/Checkbox';

import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { THEME_MODE } from 'constants/lumin-common';
import toolsName from 'constants/toolsName';

import { theme } from './SearchOverlay.theme';

import * as Styled from './SearchOverlay.styled';

const StyledFormControlLabel = withStyles({
  root: {
    marginLeft: -9,
  },
  label: {
    fontSize: 14,
    marginLeft: -4,
    fontWeight: 375,
  },
})(FormControlLabel);

const propTypes = {
  isDisabled: PropTypes.bool,
  isSearchPanelOpen: PropTypes.bool,
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
  isProgrammaticSearchFull: PropTypes.bool,
  searchListeners: PropTypes.arrayOf(PropTypes.func),
  openElement: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  setActiveResult: PropTypes.func.isRequired,
  setActiveResultIndex: PropTypes.func.isRequired,
  setIsSearching: PropTypes.func.isRequired,
  resetSearch: PropTypes.func.isRequired,
  addResults: PropTypes.func.isRequired,
  setCaseSensitive: PropTypes.func.isRequired,
  setWholeWord: PropTypes.func.isRequired,
  setNoResult: PropTypes.func.isRequired,
  setIsProgrammaticSearch: PropTypes.func.isRequired,
  setIsProgrammaticSearchFull: PropTypes.func.isRequired,
  t: PropTypes.func,
  setSearchError: PropTypes.func.isRequired,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
};

const defaultProps = {
  isDisabled: false,
  isSearchPanelOpen: false,
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
  themeMode: THEME_MODE.LIGHT,
};

const THROTTLE_TIME = 200;
class SearchOverlay extends React.PureComponent {
  constructor() {
    super();
    this.searchTextInput = React.createRef();
    this.wholeWordInput = React.createRef();
    this.caseSensitiveInput = React.createRef();
    this.wildcardInput = React.createRef();
    this.executeDebouncedFullSearch = debounce(this.executeFullSearch, 300);
  }

  componentDidMount() {
    this.searchTextInput.current.focus();
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

    const searchPanelOpened = !prevProps.isSearchPanelOpen && this.props.isSearchPanelOpen;

    if (searchPanelOpened && this.props.searchValue.trim()) {
      this.clearSearchResults();
      this.executeDebouncedFullSearch();
    }

    const searchPanelClosed = prevProps.isSearchPanelOpen && !this.props.isSearchPanelOpen;
    if (searchPanelClosed) {
      this.clearSearchResults();
    }
  }

  componentWillUnmount() {
    this.clearSearchResults();
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
    const {
      searchValue,
      addResults,
      setIsSearching,
      setNoResult,
      setActiveResultIndex,
    } = this.props;
    const isFullSearch = true;
    const searchMode = this.getSearchMode(isFullSearch);
    let resultIndex = -1;
    let noActiveResultIndex = true;
    let noResult = true;
    let tempResults = [];

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
        resultIndex++;
        throttleHandleResult();
        noResult = false;
        if (noActiveResultIndex && this.isActiveResult(result)) {
          noActiveResultIndex = false;
          setActiveResultIndex(resultIndex);
          core.setActiveSearchResult(result);
        }
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
      },
      onError: this.handleSearchError.bind(this),
    };

    core.textSearchInit(searchValue, searchMode, options);
  };

  getSearchMode = (isFull = false) => {
    const {
      isCaseSensitive,
      isWholeWord,
      isWildcard,
      isRegex,
      isSearchUp,
      isAmbientString,
    } = this.props;
    const {
      CASE_SENSITIVE,
      WHOLE_WORD,
      WILD_CARD,
      REGEX,
      PAGE_STOP,
      HIGHLIGHT,
      SEARCH_UP,
      AMBIENT_STRING,
    } = core.getSearchMode();
    let searchMode = PAGE_STOP | HIGHLIGHT;

    if (isCaseSensitive) {
      searchMode |= CASE_SENSITIVE;
    }
    if (isWholeWord) {
      searchMode |= WHOLE_WORD;
    }
    if (isWildcard) {
      searchMode |= WILD_CARD;
    }
    if (isRegex) {
      searchMode |= REGEX;
    }
    if (isSearchUp && !isFull) {
      searchMode |= SEARCH_UP;
    }
    if (isAmbientString || isFull) {
      searchMode |= AMBIENT_STRING;
    }

    return searchMode;
  };

  isActiveResult = (result) => {
    const { activeResult } = this.props;

    if (!activeResult) {
      return true;
    }

    const inSamePage = activeResult.pageNum === result.pageNum;
    const hasSameCoordinates =
      Object.values(activeResult.quads[0]).toString() ===
      Object.values(result.quads[0]).toString();

    return inSamePage && hasSameCoordinates;
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
        results,
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
    const shouldOpenSearchPanel =
      !this.props.isSearchPanelDisabled &&
      (e.metaKey || e.ctrlKey) &&
      e.which === 13;

    if (e.shiftKey && e.which === 13) {
      // Shift + Enter
      this.onClickPrevious(e);
    } else if (shouldOpenSearchPanel) {
      // (Cmd/Ctrl + Enter)
      this.onClickOverflow(e);
    } else if (e.which === 13) {
      // Enter
      this.onClickNext(e);
      // this.search();
    }
  };

  onClickNext = (e) => {
    e.preventDefault();
    const {
      // isSearchPanelOpen,
      activeResultIndex,
      results,
      setActiveResultIndex,
    } = this.props;
    // if (isSearchPanelOpen) {
    if (results.length === 0) {
      return;
    }
    const nextResultIndex =
        activeResultIndex === results.length - 1 ? 0 : activeResultIndex + 1;
    setActiveResultIndex(nextResultIndex);
    core.setActiveSearchResult(results[nextResultIndex]);
    // } else {
    //   this.executeSingleSearch()
    // }
  };

  onClickPrevious = (e) => {
    e.preventDefault();
    const {
      // isSearchPanelOpen,
      activeResultIndex,
      results,
      setActiveResultIndex,
    } = this.props;
    // if (isSearchPanelOpen) {
    if (results.length === 0) {
      return;
    }
    const prevResultIndex =
        activeResultIndex <= 0 ? results.length - 1 : activeResultIndex - 1;
    setActiveResultIndex(prevResultIndex);
    core.setActiveSearchResult(results[prevResultIndex]);
    // } else {
    //   const isSearchUp = true;
    //   this.executeSingleSearch(isSearchUp);
    // }
  };

  onClickOverflow = () => {
    const {
      activeResult, openElement, closeElements, setActiveResult,
    } = this.props;

    openElement('searchPanel');
    closeElements(['rightPanel', 'searchOverlayPopper']);
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

  render() {
    const {
      isDisabled,
      isSearchPanelOpen,
      results,
      searchValue,
      activeResultIndex,
      t,
      themeMode,
    } = this.props;
    const themeModeProvider = theme[themeMode];

    if (isDisabled) {
      return null;
    }

    const SearchOverlayClass = classNames({
      transformed: isSearchPanelOpen,
    });

    const inputHasValueClass = classNames({
      'has-value': searchValue.trim(),
    });

    return (
      <ThemeProvider theme={themeModeProvider}>
        <Styled.Container className={SearchOverlayClass}>
          <Styled.Main>
            {isSearchPanelOpen && (
              <Styled.IconSearch>
                <Icomoon className="search-thinner" size={18} />
              </Styled.IconSearch>
            )}
            <Styled.Input
              ref={this.searchTextInput}
              type="text"
              autoComplete="off"
              autoFocus
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              onClick={handlePromptCallback({ callback: () => {}, applyForTool: toolsName.REDACTION })}
              value={searchValue}
              placeholder={t('action.findInDocument')}
            />
            {isSearchPanelOpen && (
              <Styled.ResultsCount className={inputHasValueClass}>
                <span>{`${activeResultIndex + 1} / ${results.length}`}</span>
                <Styled.Divider className="transformed" />
              </Styled.ResultsCount>
            )}

            <Styled.StyledButtonMaterial
              className={inputHasValueClass}
              onClick={handlePromptCallback({ callback: this.onClickPrevious, applyForTool: toolsName.REDACTION })}
            >
              <Icomoon className="prev" size={8} />
            </Styled.StyledButtonMaterial>
            <Styled.StyledButtonMaterial
              className={inputHasValueClass}
              onClick={handlePromptCallback({ callback: this.onClickNext, applyForTool: toolsName.REDACTION })}
            >
              <Icomoon className="next" size={8} />
            </Styled.StyledButtonMaterial>
            {!isSearchPanelOpen && (
              <Styled.Divider />
            )}
            {!isSearchPanelOpen && (
              <Tooltip content={t('action.showMoreResults')} location="bottom">
                <Styled.StyledButtonMaterial
                  className="view-more"
                  onClick={handlePromptCallback({ callback: this.onClickOverflow, applyForTool: toolsName.REDACTION })}
                >
                  <Icomoon className="up-down" size={14} />
                </Styled.StyledButtonMaterial>
              </Tooltip>
            )}
          </Styled.Main>
        </Styled.Container>
        {isSearchPanelOpen && (
          <Styled.OptionsArea>
            <StyledFormControlLabel
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
            <StyledFormControlLabel
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
          </Styled.OptionsArea>
        )}
      </ThemeProvider>
    );
  }
}

SearchOverlay.propTypes = propTypes;
SearchOverlay.defaultProps = defaultProps;

export default SearchOverlay;
