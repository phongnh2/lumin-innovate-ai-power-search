import classNames from 'classnames';
import omit from 'lodash/omit';
import React, { DetailedHTMLProps, HTMLAttributes, useState } from 'react';

import { CitationPart } from '../markdown-plugins/constants';
import { CustomMarkdownProps } from '../types';

import styles from './CitationMessage.module.scss';

const CitationBlock = ({
  children,
  handleGoToPage,
}: {
  children: {
    props?: {
      node?: CustomMarkdownProps['node'];
    };
    key?: string;
  }[];
  handleGoToPage: (
    e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>,
    pageText: string
  ) => void;
}) => {
  const [hoveredCitation, setHoveredCitation] = useState('');

  const handleCitationBlockInteraction = ({
    e,
    pageText,
  }: {
    e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>;
    pageText: string;
  }) => {
    setHoveredCitation(CitationPart.CITED_TEXT);
    handleGoToPage(e, pageText);
  };

  return children.map((child) => {
    const { page = '', citationPart } = child?.props?.node?.properties || {};
    const childProps = omit(child?.props, ['node', 'citationPart']);
    if (citationPart === CitationPart.CITED_TEXT) {
      return (
        <span
          key={child?.key}
          {...childProps}
          className={classNames(styles.citedText, hoveredCitation === citationPart && styles.interactiveHovered)}
        />
      );
    }

    if (citationPart === CitationPart.CITATION_BLOCK) {
      return (
        <span
          key={child?.key}
          {...childProps}
          className={styles.citationBlock}
          onMouseEnter={() => setHoveredCitation(CitationPart.CITED_TEXT)}
          onMouseLeave={() => setHoveredCitation('')}
          onBlur={() => setHoveredCitation('')}
          onClick={(e) => handleCitationBlockInteraction({ e, pageText: page })}
          onKeyDown={(e) => handleCitationBlockInteraction({ e, pageText: page })}
          role="button"
          tabIndex={0}
        />
      );
    }

    return (
      <span key={child?.key} {...(childProps as DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>)} />
    );
  });
};

export default CitationBlock;
