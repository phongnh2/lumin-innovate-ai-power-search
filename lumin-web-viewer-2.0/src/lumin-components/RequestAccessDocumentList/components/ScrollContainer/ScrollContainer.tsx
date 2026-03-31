import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

import styles from './ScrollContainer.module.scss';

type RenderViewProps = {
  style: Record<string, unknown>;
};

type Props = {
  children: JSX.Element;
  fullList: boolean;
  isReskin?: boolean;
};

const ScrollContainer = ({ children, fullList, isReskin }: Props): JSX.Element => {
  if (isReskin) {
    return fullList ? (
      <div className={styles.scrollbarWrapper}>
        <div className={styles.scrollbarContainer}>{children}</div>
      </div>
    ) : (
      children
    );
  }

  return (
    <Scrollbars
      autoHide
      autoHeight
      autoHeightMax={fullList ? 400 : 'none'}
      autoHeightMin={0}
      renderView={(props: RenderViewProps) => (
        <div {...props} style={{ ...props.style, overflowX: 'hidden', marginBottom: '0px' }} />
      )}
    >
      {children}
    </Scrollbars>
  );
};

export default ScrollContainer;
