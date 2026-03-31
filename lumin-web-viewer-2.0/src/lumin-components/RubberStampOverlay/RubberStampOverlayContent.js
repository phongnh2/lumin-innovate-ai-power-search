import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import { leftSideBarActions, leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';
import Checkbox from '@new-ui/general-components/Checkbox';
import Tabs, { TabsList, Tab } from '@new-ui/general-components/Tabs';

import actions from 'actions';
import selectors from 'selectors';

import { useCleanup } from 'hooks/useCleanup';
import { useTranslation } from 'hooks/useTranslation';

import { eventTracking } from 'utils';

import { quickSearchSelectors, setIsOpenQuickSearch } from 'features/QuickSearch/slices';

import { TOOLS_NAME } from 'constants/toolsName';

import DefaultStampList from './components/DefaultStampList';
import RubberStampList from './components/RubberStampList';
import { PLACE_MULTIPLE_STAMP_CHECKBOX_EVENT } from './constants';

import * as styles from './RubberStampOverlay.styled';

const TabContentValue = {
  Standard: 1,
  Custom: 2,
};

const rubberTabsPropTypes = {
  tabValue: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isOffline: PropTypes.bool.isRequired,
};

const RubberTabs = ({ tabValue, onTabChange, t, isOffline }) => (
  <Tabs value={tabValue} onChange={onTabChange}>
    <TabsList>
      <Tab value={TabContentValue.Standard}>{t('viewer.stamp.standard')}</Tab>
      <Tab value={TabContentValue.Custom} disabled={isOffline}>
        {t('viewer.stamp.custom')}
      </Tab>
    </TabsList>
  </Tabs>
);

RubberTabs.propTypes = rubberTabsPropTypes;

const RubberStampOverlayContent = ({ isPlacingMultipleRubberStamp, setPlacingMultipleRubberStamp, closePopper }) => {
  const [tabValue, setTabValue] = useState(1);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isOffline = useSelector(selectors.isOffline);
  const activeToolName = useSelector(selectors.getActiveToolName);
  const isOpenQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);
  const isLeftSidebarPopoverOpened = useSelector(leftSideBarSelectors.isLeftSidebarPopoverOpened);

  const layoutConfigs = {
    overlayContainer: styles.container,
  };

  const onTabChange = (_, value) => {
    setTabValue(value);
  };

  const renderTabContent = (value) => {
    switch (value) {
      case TabContentValue.Standard: {
        return (
          <div className="rubber-stamp-overlay--tab-content">
            <DefaultStampList closePopper={closePopper} />
          </div>
        );
      }
      case TabContentValue.Custom: {
        return (
          <div className="rubber-stamp-overlay--tab-content">
            <RubberStampList closePopper={closePopper} />
          </div>
        );
      }
      default: {
        return null;
      }
    }
  };

  const onCheckboxChange = () => {
    setPlacingMultipleRubberStamp(!isPlacingMultipleRubberStamp);
    eventTracking(PLACE_MULTIPLE_STAMP_CHECKBOX_EVENT.TYPE, {
      ...PLACE_MULTIPLE_STAMP_CHECKBOX_EVENT.PARAMS,
      status: !isPlacingMultipleRubberStamp,
    });
  };

  const renderCheckbox = () => (
    <label css={styles.checkboxLabel}>
      <Checkbox
        onChange={onCheckboxChange}
        checked={isPlacingMultipleRubberStamp}
        inputProps={{
          'data-cy': 'rubber_stamp_overlay_checkbox',
        }}
      />
      {t('viewer.stamp.placeStampMultipleTimes')}
    </label>
  );

  useCleanup(() => {
    if ((isOpenQuickSearch || isLeftSidebarPopoverOpened) && activeToolName === TOOLS_NAME.RUBBER_STAMP) {
      dispatch(setIsOpenQuickSearch(false));
      dispatch(leftSideBarActions.setHoveredNavigationTabs(null));
      dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false));
    }
  }, [activeToolName]);

  return (
    <div css={layoutConfigs.overlayContainer}>
      <RubberTabs tabValue={tabValue} t={t} onTabChange={onTabChange} isOffline={isOffline} />

      {renderTabContent(tabValue)}

      {renderCheckbox()}
    </div>
  );
};

RubberStampOverlayContent.propTypes = {
  isPlacingMultipleRubberStamp: PropTypes.bool.isRequired,
  setPlacingMultipleRubberStamp: PropTypes.func.isRequired,
  closePopper: PropTypes.func,
};

RubberStampOverlayContent.defaultProps = {
  closePopper: (f) => f,
};

const mapStateToProps = (state) => ({
  isPlacingMultipleRubberStamp: selectors.isPlacingMultipleRubberStamp(state),
});

const mapDispatchToProps = (dispatch) => ({
  setPlacingMultipleRubberStamp: (args) => dispatch(actions.setPlacingMultipleRubberStamp(args)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RubberStampOverlayContent);
