import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getShortcut } from '@new-ui/components/LuminToolbar/utils';
import IconButton from '@new-ui/general-components/IconButton';

import * as Styled from './FocusModeSideBar.styled';

interface IFocusModeSideBarProps {
  sideBarContent: JSX.Element;
  onExpand?: () => void;
  isInFocusMode: boolean;
  isLeftSideBar: boolean;
  isInPresenterMode: boolean;
}

const FocusModeSideBar = (props: IFocusModeSideBarProps) => {
  const { t } = useTranslation();
  const { sideBarContent, onExpand, isInFocusMode, isLeftSideBar, isInPresenterMode } = props;
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const [warningBannerHeight, setWarningBannerHeight] = useState(0);
  const [showFocusModeSideBar, setShowFocusModeSideBar] = useState(false);

  const isHoveredFocusModeSideBar = showFocusModeSideBar && isInFocusMode;

  const ref = useRef<HTMLDivElement>(null);

  const onHoveringFocusModeSideBar = () => {
    setShowFocusModeSideBar(true);
  };

  const onLeavingFocusModeSideBar = () => {
    setShowFocusModeSideBar(false);
  };

  useEffect(() => {
    const focusModeSideBar = ref.current;
    if (!focusModeSideBar && (!isInFocusMode || isInPresenterMode)) {
      return null;
    }

    focusModeSideBar.addEventListener('mouseover', onHoveringFocusModeSideBar);
    focusModeSideBar.addEventListener('mouseleave', onLeavingFocusModeSideBar);

    return () => {
      focusModeSideBar.removeEventListener('mouseover', onHoveringFocusModeSideBar);
      focusModeSideBar.removeEventListener('mouseleave', onLeavingFocusModeSideBar);
    };
  }, [isInFocusMode, isInPresenterMode]);

  let width: string | number = 0;
  let opacity = 0;

  if (!isInPresenterMode) {
    const focusModeSideBarWidth = isLeftSideBar
      ? 'var(--lumin-left-side-bar-width)'
      : 'var(--lumin-right-side-bar-width)';
    width = isHoveredFocusModeSideBar ? focusModeSideBarWidth : 'var(--focus-mode-side-bar-hovering-width)';
    opacity = isHoveredFocusModeSideBar ? 1 : 0;
  }

  useEffect(() => {
    setToolbarHeight(document.getElementById('toolbar')?.offsetHeight || 0);
    setWarningBannerHeight(document.querySelector('#WarningBanner__container')?.clientHeight || 0);
  }, [showFocusModeSideBar]);

  return (
    <>
      <Styled.FocusModeSideBar
        ref={ref}
        isLeftSideBar={isLeftSideBar}
        style={{
          width,
          height: `calc(100vh - ${toolbarHeight + warningBannerHeight}px)`,
          opacity,
          zIndex: isInFocusMode ? 'var(--lumin-base-side-bar-z-index)' : 0,
        }}
      >
        {isInFocusMode && (
          <>
            <div
              style={{
                visibility: isHoveredFocusModeSideBar ? 'visible' : 'hidden',
                pointerEvents: isHoveredFocusModeSideBar ? 'auto' : 'none',
              }}
            >
              {sideBarContent}
            </div>
            {isLeftSideBar && (
              <IconButton
                icon="lg_expand_right_panel"
                iconSize={24}
                size="large"
                onClick={onExpand}
                tooltipData={{
                  location: 'left',
                  title: t('generalLayout.focusMode.tooltip'),
                  shortcut: getShortcut('focusMode'),
                }}
              />
            )}
          </>
        )}
      </Styled.FocusModeSideBar>
      {isLeftSideBar && !isInPresenterMode ? (
        <Styled.ExpanderWrapper data-is-focus-mode={isInFocusMode}>
          <Styled.ExpanderButton icon="lg_expand_right_panel" iconSize={24} size="large" $show={showFocusModeSideBar} />
        </Styled.ExpanderWrapper>
      ) : null}
    </>
  );
};

export default FocusModeSideBar;
