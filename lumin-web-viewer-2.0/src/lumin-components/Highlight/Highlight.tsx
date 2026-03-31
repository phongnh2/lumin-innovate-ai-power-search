import React from 'react';

import { useEnableWebReskin, useScrollToElement } from 'hooks';

import { useRemoveHighlight } from './hooks';

import * as Styled from './Highlight.styled';

type HighlightProps = {
  children: JSX.Element;
  isHighlight?: boolean;
  scrollOptions?: ScrollIntoViewOptions;
};

const Highlight = ({ children, isHighlight = true, scrollOptions = {} }: HighlightProps): JSX.Element => {
  const { isEnableReskin } = useEnableWebReskin();
  const { isRemovedHighlight } = useRemoveHighlight({ isHighlight });
  const { elementRef: highlightElementRef } = useScrollToElement({
    scrollToElement: !isRemovedHighlight,
    scrollOptions,
  });

  return isRemovedHighlight ? (
    children
  ) : (
    <>
      <Styled.Overlay data-reskin={isEnableReskin} />
      <Styled.Wrapper ref={highlightElementRef}>{children}</Styled.Wrapper>
    </>
  );
};

export default Highlight;
