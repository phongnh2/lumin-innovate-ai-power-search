import React, { ReactNode, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';

import { useTranslation } from 'hooks';

import useContentSize, { ContentStatus } from './useContentSize';

import * as Styled from './CollapsibleComment.styled';

interface IProps {
  content: ReactNode;
  annotation?: Core.Annotations.Annotation;
  onLayoutInit?: () => void;
}

const CollapsibleComment = ({ content, annotation, onLayoutInit }: IProps) => {
  const [collapsed, setIsCollapsed] = useState(true);
  const { contentDisplay, contentRef } = useContentSize({ annotation });
  const { t } = useTranslation();

  const previousContentDisplay = usePrevious(contentDisplay);

  const isColappsibleContent = () => contentDisplay === ContentStatus.Collapsed;
  const handleClick = () => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const firstUpdateAfterRender =
      contentDisplay !== ContentStatus.Initial && previousContentDisplay === ContentStatus.Initial;
    if (firstUpdateAfterRender) {
      onLayoutInit?.();
    }
  }, [contentDisplay]);

  return (
    <Styled.Wrapper>
      <Styled.ContentOuter data-collapsed={collapsed}>
        <Styled.ContentInner ref={contentRef}>{content}</Styled.ContentInner>
      </Styled.ContentOuter>
      {isColappsibleContent() && (
        <Styled.ActionButton role="button" tabIndex={0} onClick={handleClick}>
          {collapsed ? t('viewer.noteContent.showMore') : t('viewer.noteContent.showLess')}
        </Styled.ActionButton>
      )}
    </Styled.Wrapper>
  );
};

export default CollapsibleComment;
