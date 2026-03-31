import React from 'react';

import PageRangeSelection from 'lumin-components/GeneralLayout/components/PageRangeSelection';
import { PAGE_RANGE_OPTIONS } from 'lumin-components/GeneralLayout/components/PageRangeSelection/constants';

import { useCropPanelContext } from '../../CropPanelContext';
import { useCropPageRange } from '../../hooks/useCropPageRange';

const CropPageRange = () => {
  const { cropMode, pageRangeValue, pageRangeError, setCropMode, setPageRangeValue, onPageRangeBlur } =
    useCropPanelContext();

  useCropPageRange({ cropMode, pageRangeValue, setCropMode, setPageRangeValue });

  return (
    <PageRangeSelection
      listPageRanges={Object.values(PAGE_RANGE_OPTIONS)}
      pageRangeType={cropMode}
      pageRangeValue={pageRangeValue}
      pageRangeError={pageRangeError}
      setPageRange={setCropMode}
      onPageRangeBlur={onPageRangeBlur}
      onPageRangeValueChange={setPageRangeValue}
    />
  );
};

export default CropPageRange;
