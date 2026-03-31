import classNames from 'classnames';
import { ScrollArea } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import LuminSearchResult from '@new-ui/components/LuminRightPanel/components/LuminSearchPanel/components/LuminSearchResult';
import LuminSearchOverlay from '@new-ui/components/SearchOverlay';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import ListSeparator from 'lumin-components/GeneralLayout/components/LuminRightPanel/components/LuminSearchPanel/components/ListSeparator';
import { LayoutElements } from 'lumin-components/GeneralLayout/constants';
import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { isMobile, isTabletOrMobile } from 'helpers/device';
import fireEvent from 'helpers/fireEvent';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { CUSTOM_EVENT } from 'constants/customEvent';
import DataElements from 'constants/dataElement';
import toolsName from 'constants/toolsName';

import * as Styled from './LuminSearchPanel.styled';

class LuminSearchPanel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedPage: null,
    };
  }

  componentDidUpdate() {
    if (isTabletOrMobile()) {
      this.props.setIsLeftPanelOpen(false);
    }
  }

  componentWillUnmount() {
    const { resetSearch } = this.props;
    resetSearch();
    core.clearSearchResults();
  }

  onClickResult = (resultIndex, result) => {
    const { setActiveResultIndex, setIsRightPanelOpen, isRightPanelOpen } = this.props;
    if (result) {
      this.setState({ selectedPage: result.page_num });
    }
    setActiveResultIndex(resultIndex);
    core.setActiveSearchResult(result);

    if (isMobile()) {
      setIsRightPanelOpen(!isRightPanelOpen);
    }
  };

  onClickClose = () => {
    const { isRightPanelOpen, setSearchOverlayValue } = this.props;
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.DEFAULT,
      isOpen: !isRightPanelOpen,
    });
    setSearchOverlayValue(false);
  };

  renderListSeparator = (prevResult, currResult) => {
    const isFirstResult = prevResult === currResult;
    const isInDifferentPage = prevResult.pageNum !== currResult.pageNum;
    if (isFirstResult || isInDifferentPage) {
      return (
        <ListSeparator
          selectedPage={this.state.selectedPage}
          currentPage={currResult.page_num}
          renderContent={() => `${this.props.t('option.shared.page')} ${this.props.pageLabels[currResult.pageNum - 1]}`}
        />
      );
    }

    return null;
  };

  render() {
    const { t, results, isSearching, noResult, isWildCardSearchDisabled, errorMessage, searchValue } = this.props;

    return (
      <>
        <Styled.SearchPanelHeader>
          <Styled.Title>{t('common.search')}</Styled.Title>
          <IconButton
            icon="close-btn"
            size="medium"
            iconSize={24}
            onClick={handlePromptCallback({ callback: this.onClickClose, applyForTool: toolsName.REDACTION })}
          />
        </Styled.SearchPanelHeader>
        <LuminSearchOverlay />
        <Styled.CustomDivider />
        <ScrollArea>
          <Styled.ResultWrapper
            className={classNames('results', {
              'wild-card-visible': !isWildCardSearchDisabled,
            })}
          >
            {!noResult && !searchValue.trim() && (
              <Styled.ResultInfo>{t('viewer.searchPanel.yourResultsWillBeShownInHere')}</Styled.ResultInfo>
            )}
            {isSearching && searchValue.trim() && <Styled.ResultInfo>{t('message.searching')}</Styled.ResultInfo>}
            {noResult && <Styled.ResultInfo>{t('viewer.searchPanel.couldNotFindResults')}</Styled.ResultInfo>}
            {errorMessage && <Styled.ResultInfo>{errorMessage}</Styled.ResultInfo>}
            {results.map((result, i) => {
              const prevResult = i === 0 ? results[0] : results[i - 1];

              return (
                <React.Fragment key={i}>
                  {this.renderListSeparator(prevResult, result)}
                  <LuminSearchResult
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
          </Styled.ResultWrapper>
        </ScrollArea>
      </>
    );
  }
}

LuminSearchPanel.propTypes = {
  isWildCardSearchDisabled: PropTypes.bool,
  results: PropTypes.arrayOf(PropTypes.object),
  isSearching: PropTypes.bool,
  noResult: PropTypes.bool,
  setActiveResultIndex: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  pageLabels: PropTypes.array.isRequired,
  searchValue: PropTypes.string,
  setIsLeftPanelOpen: PropTypes.func,
  isRightPanelOpen: PropTypes.bool,
  setIsRightPanelOpen: PropTypes.func,
  setSearchOverlayValue: PropTypes.func,
  resetSearch: PropTypes.func.isRequired,
};

LuminSearchPanel.defaultProps = {
  isWildCardSearchDisabled: false,
  results: [],
  isSearching: false,
  noResult: true,
  errorMessage: '',
  searchValue: '',
  setIsLeftPanelOpen: () => {},
  isRightPanelOpen: false,
  setIsRightPanelOpen: () => {},
  setSearchOverlayValue: () => {},
};

const mapStateToProps = (state) => ({
  isWildCardSearchDisabled: selectors.isElementDisabled(state, 'wildCardSearchOption'),
  isSearching: selectors.isSearching(state),
  results: selectors.getResults(state),
  errorMessage: selectors.getSearchErrorMessage(state),
  noResult: selectors.isNoResult(state),
  isShowTopBar: selectors.getIsShowTopBar(state),
  pageLabels: selectors.getPageLabels(state),
  searchValue: selectors.getSearchValue(state),
  isPageEditMode: selectors.isPageEditMode(state),
  isShowToolbarTablet: selectors.getIsShowToolbarTablet(state),
  isShowBannerAds: selectors.getIsShowBannerAds(state),
  isOpenRightToolPanel: selectors.isElementOpen(state, DataElements.RIGHT_TOOL_PANEL),
  isLeftPanelOpen: selectors.isLeftPanelOpen(state),
  leftPanelValue: selectors.leftPanelValue(state),
  isRightPanelOpen: selectors.isRightPanelOpen(state),
  rightPanelValue: selectors.rightPanelValue(state),
});

const mapDispatchToProps = {
  setActiveResultIndex: actions.setActiveResultIndex,
  setIsLeftPanelOpen: (isLeftPanelOpen) => actions.setIsLeftPanelOpen(isLeftPanelOpen),
  setIsRightPanelOpen: (args) => actions.setIsRightPanelOpen(args),
  setSearchOverlayValue: (args) => actions.setSearchOverlayValue(args),
  resetSearch: actions.resetSearch,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LuminSearchPanel));
