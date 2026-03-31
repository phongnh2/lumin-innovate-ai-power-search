import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { DocumentListSkeleton, DocumentGridSkeleton } from 'lumin-components/ReskinLayout/components/DocumentLoading';

import { useEnableWebReskin } from 'hooks';

import { layoutType, TOTAL_DOCUMENT_DUMMY } from 'constants/documentConstants';

import DocumentGridItemSkeleton from './DocumentGridItemSkeleton';
import DocumentListItemSkeleton from './DocumentListItemSkeleton';

import * as Styled from './DocumentSkeleton.styled';

function DocumentSkeleton({ layout, columnCount, count }) {
  const { isEnableReskin } = useEnableWebReskin();
  const LOADING_DUMMIES = Array(count).fill();
  const isGrid = layout === layoutType.grid;

  const SkeletonComponent = useMemo(() => {
    const components = {
      [layoutType.list]: isEnableReskin ? DocumentListSkeleton : DocumentListItemSkeleton,
      [layoutType.grid]: isEnableReskin ? DocumentGridSkeleton : DocumentGridItemSkeleton,
    };
    return components[layout];
  }, [isEnableReskin, layout]);

  if (isGrid) {
    return (
      <Styled.GridContainer $column={columnCount}>
        {LOADING_DUMMIES.map((_, idx) => (
          <SkeletonComponent key={idx} />
        ))}
      </Styled.GridContainer>
    );
  }
  return (
    <div>
      {LOADING_DUMMIES.map((_, idx) => (
        <SkeletonComponent key={idx} />
      ))}
    </div>
  );
}

DocumentSkeleton.propTypes = {
  layout: PropTypes.string.isRequired,
  columnCount: PropTypes.number,
  count: PropTypes.number,
};
DocumentSkeleton.defaultProps = {
  columnCount: 1,
  count: TOTAL_DOCUMENT_DUMMY,
};

export default DocumentSkeleton;
