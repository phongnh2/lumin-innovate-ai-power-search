import { connect } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

import { LayoutElements } from 'luminComponents/GeneralLayout/constants';

import { DataElements } from 'constants/dataElement';

import { IPageNavigationProps } from './interface';
import PageNavigation from './PageNavigation';

const mapStateToProps = (state: RootState): IPageNavigationProps => ({
  isRightPanelOpen: selectors.isRightPanelOpen(state) && selectors.rightPanelValue(state) !== LayoutElements.DEFAULT,
  isDisabled: selectors.isElementDisabled(state, DataElements.PAGE_NAVIGATION_OVERLAY),
  isPageInfoAvaiable: !!selectors.getCurrentPage(state) && !!selectors.getTotalPages(state),
  isLeftPanelOpen: selectors.isLeftPanelOpen(state),
  isToolPropertiesOpen: selectors.isToolPropertiesOpen(state),
  isPreviewOriginalVersionMode: selectors.isPreviewOriginalVersionMode(state),
  isInFocusMode: selectors.isInFocusMode(state),
  isInPresenterMode: selectors.isInPresenterMode(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(PageNavigation);
