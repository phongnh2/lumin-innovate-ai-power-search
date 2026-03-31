/* eslint-disable jsx-a11y/control-has-associated-label */
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { connect } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import IconButton from 'luminComponents/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import displayModeObjects from 'constants/displayModeObjects';

import * as Styled from './ViewControlTool.styled';

const TRANSITIONS = [
  {
    value: 'default',
    icon: 'md_single_page_view',
    tooltipTitle: 'option.pageTransition.default',
    dataElement: 'defaultPageTransitionButton',
  },
  {
    value: 'continuous',
    icon: 'md_continues_page_view',
    tooltipTitle: 'option.pageTransition.continuous',
    dataElement: 'continuousPageTransitionButton',
  },
];

const LAYOUTS = [
  {
    value: 'single',
    icon: 'md_one_page_view',
    tooltipTitle: 'option.layout.single',
    dataElement: 'singleLayoutButton',
  },
  {
    value: 'double',
    icon: 'md_two_page_view',
    tooltipTitle: 'option.layout.double',
    dataElement: 'doubleLayoutButton',
  },
  {
    value: 'cover',
    icon: 'md_cover_page_view',
    tooltipTitle: 'generalLayout.toolbar.coverFacingPage',
    dataElement: 'coverLayoutButton',
  },
];

const ViewControlToolContent = ({ displayMode }) => {
  const { t } = useTranslation();
  const { pageTransition, layout } = useMemo(
    () => displayModeObjects.find((obj) => obj.displayMode === displayMode),
    [displayMode]
  );

  const handleClick = useCallback((pageTransition, layout) => {
    const displayModeObject = displayModeObjects.find(
      (obj) => obj.pageTransition === pageTransition && obj.layout === layout
    );

    core.setDisplayMode(displayModeObject.displayMode);
  }, []);

  const getPageTransitionActiveState = useCallback(
    (_pageTransition) => _pageTransition === pageTransition,
    [pageTransition]
  );
  const getPageLayoutActiveState = useCallback((_layout) => _layout === layout, [layout]);

  return (
    <Styled.ContentWrapper>
      <Styled.Title>{t('option.displayMode.pageTransition')}</Styled.Title>

      {TRANSITIONS.map(({ value, icon, tooltipTitle, dataElement }) => (
        <IconButton
          iconSize={24}
          key={value}
          onClick={() => handleClick(value, layout)}
          active={getPageTransitionActiveState(value)}
          icon={icon}
          dataElement={dataElement}
          tooltipData={{ placement: 'bottom', title: t(tooltipTitle) }}
        />
      ))}

      <button style={{ visibility: 'hidden', pointerEvents: 'none' }} />

      <Styled.Title>{t('option.displayMode.layout')}</Styled.Title>

      {LAYOUTS.map(({ value, icon, tooltipTitle, dataElement }) => (
        <IconButton
          iconSize={24}
          key={value}
          onClick={() => handleClick(pageTransition, value)}
          active={getPageLayoutActiveState(value)}
          icon={icon}
          dataElement={dataElement}
          tooltipData={{ placement: 'bottom', title: t(tooltipTitle) }}
        />
      ))}
    </Styled.ContentWrapper>
  );
};

ViewControlToolContent.propTypes = {
  displayMode: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  displayMode: selectors.getDisplayMode(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ViewControlToolContent);
