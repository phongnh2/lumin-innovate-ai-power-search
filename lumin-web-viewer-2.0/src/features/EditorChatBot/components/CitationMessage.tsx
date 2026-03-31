import React from 'react';

import core from 'core';

import { KeyboardKeys } from 'constants/keyboardKey';

import CitationBlock from './CitationBlock';
import { CitationPart } from '../markdown-plugins/constants';
import { CustomMarkdownProps } from '../types';

type ChildrenProps = {
  props: {
    node: CustomMarkdownProps['node'];
  };
};

const CitationMessage = ({ children, ...restProps }: { children: React.ReactElement | React.ReactElement[] }) => {
  const handleGoToPage = (
    e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>,
    pageText: string
  ) => {
    e.stopPropagation();
    if (e.type === 'keydown') {
      const keyboardEvent = e as React.KeyboardEvent<HTMLSpanElement>;
      if (!([KeyboardKeys.ENTER, KeyboardKeys.SPACE] as string[]).includes(keyboardEvent.key)) {
        return;
      }
    }

    const totalPages = core.getTotalPages();
    const page = Number(pageText);
    if (!Number.isFinite(page) || page > totalPages) {
      return;
    }

    core.setCurrentPage(page);
  };

  const citationPart = (restProps as ChildrenProps['props'])?.node?.properties?.citationPart;
  if (citationPart === CitationPart.CITATION_CONTAINER) {
    return <CitationBlock handleGoToPage={handleGoToPage}>{children as ChildrenProps[]}</CitationBlock>;
  }

  if ([CitationPart.CITATION_BLOCK, CitationPart.CITED_TEXT].includes(citationPart)) {
    return null;
  }

  return children as React.ReactElement;
};

export default CitationMessage;
