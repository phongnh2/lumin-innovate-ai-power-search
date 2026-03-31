import React, { useCallback, useRef, useState } from 'react';

import { useCleanup } from 'hooks';

import { PanelWidth } from 'constants/styles';

import MobilePageNumberIndicator from './components/MobilePageNumberIndicator/MobilePageNumberIndicator';
import PageIndication from './components/PageIndication';
import PresenterModePageNavigation from './components/PresenterModePageNavigation/PresenterModePageNavigation';
import ZoomIndication from './components/ZoomIndication';
import { useHideNavigationOnScroll } from './hook/useHideNavigationOnScroll';
import { IPageNavigationProps } from './interface';

import * as Styled from './PageNavigation.styled';

const timeoutDuration = 3000;

const PageNavigation = ({
  isDisabled,
  isPageInfoAvaiable,
  isInFocusMode,
  isInPresenterMode,
  isRightPanelOpen,
  isLeftPanelOpen,
  isToolPropertiesOpen,
  isPreviewOriginalVersionMode,
  isNarrowScreen,
}: IPageNavigationProps & { isNarrowScreen: boolean }): JSX.Element => {
  const [active, setActive] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onShow = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setActive(true);
  };

  const isFocusing = () => containerRef.current?.contains(document.activeElement);

  const onHide = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    if (isFocusing()) {
      return;
    }

    timeout.current = setTimeout(() => {
      setActive(false);
    }, timeoutDuration);
  };

  const resetTimeout = useCallback(() => clearTimeout(timeout.current), []);
  useCleanup(resetTimeout);

  useHideNavigationOnScroll({ setActive, onMouseLeave: onHide });

  const containerStyles = {
    left: `calc(
      ${isPreviewOriginalVersionMode ? '0px' : 'var(--lumin-left-side-bar-width)'}
      + ${isLeftPanelOpen ? PanelWidth.LUMIN_LEFT_PANEL : '0px'}
    )`,
    right: `calc(
      ${isPreviewOriginalVersionMode ? '0px' : 'var(--lumin-right-side-bar-width)'}
      + ${isRightPanelOpen ? PanelWidth.LUMIN_RIGHT_PANEL : '0px'}
      + ${isToolPropertiesOpen ? PanelWidth.LUMIN_TOOL_PROPERTIES : '0px'}
    )`,
  } as React.CSSProperties;

  if (isDisabled || !isPageInfoAvaiable) {
    return null;
  }

  if (isNarrowScreen) {
    return <MobilePageNumberIndicator />;
  }

  if (isInPresenterMode) {
    return <PresenterModePageNavigation />;
  }

  return (
    <Styled.Container
      onMouseEnter={onShow}
      onMouseLeave={onHide}
      onFocusCapture={onShow}
      onBlurCapture={onHide}
      ref={containerRef}
      style={!isInFocusMode ? containerStyles : { left: 0, right: 0 }}
    >
      <Styled.Paper elevation={active ? 2 : 0} data-active={active}>
        <Styled.Wrapper>
          <ZoomIndication />
          <Styled.CustomDivider orientation="vertical" />
          <PageIndication isInPresenterMode={isInPresenterMode} />
        </Styled.Wrapper>
      </Styled.Paper>
    </Styled.Container>
  );
};

export default PageNavigation;
