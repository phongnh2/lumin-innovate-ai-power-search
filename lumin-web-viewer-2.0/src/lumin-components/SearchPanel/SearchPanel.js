/* eslint-disable react/no-did-update-set-state */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ListSeparator from 'luminComponents/ListSeparator';
import Button from 'luminComponents/ViewerCommon/ButtonLumin';

import { isMobile, isTabletOrMobile } from 'helpers/device';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import DataElements from 'constants/dataElement';
import toolsName from 'constants/toolsName';

import './SearchPanelLumin.scss';

const SearchResult = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/SearchResult'));
const SearchOverlay = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/SearchOverlay'));

class SearchPanel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: null,
    };
  }

  componentDidUpdate(prevProps) {
    const { setActiveResultIndex, results } = this.props;
    if (!prevProps.isOpen && this.props.isOpen && isTabletOrMobile()) {
      this.props.closeElement('leftPanel');
    }

    if (!prevProps.results.length && results.length) {
      setActiveResultIndex(0);
      this.setState({ selectedPage: results[0].page_num });
    }
  }

  onClickResult = (resultIndex, result) => {
    const { setActiveResultIndex, closeElement } = this.props;
    if (result) {
      this.setState({ selectedPage: result.page_num });
    }
    setActiveResultIndex(resultIndex);
    core.setActiveSearchResult(result);

    if (isMobile()) {
      closeElement('searchPanel');
    }
  };

  onClickClose = () => {
    this.props.closeElements(['searchPanel', 'searchOverlay']);
  };

  renderListSeparator = (prevResult, currResult) => {
    const isFirstResult = prevResult === currResult;
    const isInDifferentPage = prevResult.pageNum !== currResult.pageNum;
    if (isFirstResult || isInDifferentPage) {
      return (
        <ListSeparator
          selectedPage={this.state.selectedPage}
          currentPage={currResult.page_num}
          renderContent={() => `${this.props.t('option.shared.page')} ${
            this.props.pageLabels[currResult.pageNum - 1]
          }`}
        />
      );
    }

    return null;
  };

  render() {
    const {
      isDisabled,
      t,
      results,
      isSearching,
      noResult,
      isShowTopBar,
      isWildCardSearchDisabled,
      errorMessage,
      isPageEditMode,
      isOpen = true,
      searchValue,
      isShowBannerAds,
      isShowToolbarTablet,
      isOpenRightToolPanel,
      showWarningBanner,
      isInContentEditMode,
    } = this.props;

    if (isDisabled) {
      return null;
    }

    const className = classNames('Panel SearchPanel', {
      'has-warning-banner': showWarningBanner,
      'has-top-bar': isShowTopBar,
      'has-toolbar': isShowToolbarTablet,
      'has-banner': isShowBannerAds,
      'is-in-content-edit-mode': isInContentEditMode,
      'open-right-toolbar': isOpenRightToolPanel,
      open: isOpen || !isPageEditMode,
      closed: !isOpen || isPageEditMode,
    });

    return (
      <div className={className} data-element="searchPanel">
        <div className="SearchPanel__top">
          <p>{t('common.search')}</p>
          <Button icon="cancel" dataElement="searchPanelCloseButton" onClick={handlePromptCallback({ callback: this.onClickClose, applyForTool: toolsName.REDACTION })} iconSize={14} />
        </div>
        <SearchOverlay />

        <div className="SearchPanel__divider" />
        <div className={`results custom-scrollbar ${isWildCardSearchDisabled ? '' : 'wild-card-visible'}`}>
          {!noResult && !searchValue.trim() &&
            <div className="info">{t('viewer.searchPanel.yourResultsWillBeShownInHere')}</div>}
          {isSearching &&
            <div className="info">{t('message.searching')}</div>}
          {noResult &&
            <div className="info">{t('message.noResults')}</div>}
          {errorMessage && <div className="warn">{errorMessage}</div>}
          {results.map((result, i) => {
            const prevResult = i === 0 ? results[0] : results[i - 1];

            return (
              <React.Fragment key={i}>
                {this.renderListSeparator(prevResult, result)}
                <SearchResult
                  result={result}
                  index={i}
                  onClickResult={handlePromptCallback({
                    callback: this.onClickResult,
                    applyForTool: toolsName.REDACTION,
                  })}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }
}

SearchPanel.propTypes = {
  isDisabled: PropTypes.bool,
  isWildCardSearchDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  results: PropTypes.arrayOf(PropTypes.object),
  isSearching: PropTypes.bool,
  noResult: PropTypes.bool,
  setActiveResultIndex: PropTypes.func.isRequired,
  closeElement: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  pageLabels: PropTypes.array.isRequired,
  isShowTopBar: PropTypes.bool,
  isPageEditMode: PropTypes.bool,
  searchValue: PropTypes.string,
  isShowBannerAds: PropTypes.bool,
  isShowToolbarTablet: PropTypes.bool,
  isOpenRightToolPanel: PropTypes.bool,
  showWarningBanner: PropTypes.bool,
  isInContentEditMode: PropTypes.bool,
};

SearchPanel.defaultProps = {
  isDisabled: false,
  isWildCardSearchDisabled: false,
  isOpen: false,
  results: [],
  isSearching: false,
  noResult: true,
  errorMessage: '',
  isShowTopBar: true,
  isPageEditMode: false,
  searchValue: '',
  isShowBannerAds: false,
  isShowToolbarTablet: false,
  isOpenRightToolPanel: false,
  showWarningBanner: false,
  isInContentEditMode: false,
};

const mapStateToProps = (state) => ({
  isDisabled: selectors.isElementDisabled(state, 'searchPanel'),
  isWildCardSearchDisabled: selectors.isElementDisabled(state, 'wildCardSearchOption'),
  isOpen: selectors.isElementOpen(state, 'searchPanel'),
  results: selectors.getResults(state),
  isSearching: selectors.isSearching(state),
  noResult: selectors.isNoResult(state),
  errorMessage: selectors.getSearchErrorMessage(state),
  pageLabels: selectors.getPageLabels(state),
  isShowTopBar: selectors.getIsShowTopBar(state),
  isPageEditMode: selectors.isPageEditMode(state),
  searchValue: selectors.getSearchValue(state),
  isShowBannerAds: selectors.getIsShowBannerAds(state),
  isShowToolbarTablet: selectors.getIsShowToolbarTablet(state),
  isOpenRightToolPanel: selectors.isElementOpen(state, DataElements.RIGHT_TOOL_PANEL),
  isInContentEditMode: selectors.isInContentEditMode(state),
});

const mapDispatchToProps = {
  setActiveResultIndex: actions.setActiveResultIndex,
  closeElement: actions.closeElement,
  closeElements: actions.closeElements,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SearchPanel));
