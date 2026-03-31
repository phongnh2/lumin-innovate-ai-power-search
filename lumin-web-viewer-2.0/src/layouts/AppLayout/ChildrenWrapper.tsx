import classNames from 'classnames';
import React from 'react';

import * as Styled from './AppLayout.styled';

import styles from './AppLayout.module.scss';

type Props = {
  isEnableReskin: boolean;
  children: React.ReactNode;
  sidebar: boolean;
  bodyScrollRef: React.RefObject<HTMLDivElement>;
  isOffline: boolean;
  isInDocumentPage: boolean;
};

const ChildrenWrapper = ({ isEnableReskin, children, sidebar, bodyScrollRef, isOffline, isInDocumentPage }: Props) => {
  if (isEnableReskin) {
    return (
      <div className={styles.contentContainer} data-offline={isOffline && !isInDocumentPage}>
        {children}
      </div>
    );
  }
  return (
    <Styled.ChildrenWrapper
      className={classNames('custom-scrollbar', {
        'custom-scrollbar--stable-center': sidebar,
      })}
      ref={bodyScrollRef}
      $isOffline={isOffline && !isInDocumentPage}
    >
      {children}
    </Styled.ChildrenWrapper>
  );
};

export default ChildrenWrapper;
