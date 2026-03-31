import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import FocusModeSideBar from 'luminComponents/FocusModeSideBar';

import RightSideBarContent from './RightSideBarContent';

import styles from './RightSideBarContent.module.scss';

const RightSideBar = () => {
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);

  const isInFocusMode = useSelector(selectors.isInFocusMode);
  const isInPresenterMode = useSelector(selectors.isInPresenterMode);

  if (isPreviewOriginalVersionMode) {
    return null;
  }

  return (
    <>
      <div
        className={classNames(
          styles.rightSideBarWrapper,
          isInFocusMode && styles.focusMode,
          isInPresenterMode && styles.presenterMode
        )}
      >
        {!isInFocusMode ? <RightSideBarContent /> : null}
      </div>
      <FocusModeSideBar
        sideBarContent={<RightSideBarContent />}
        isInFocusMode={isInFocusMode}
        isLeftSideBar={false}
        isInPresenterMode={isInPresenterMode}
      />
    </>
  );
};

export default RightSideBar;
