import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { useCropPanelContext } from '../../CropPanelContext';
import DimensionGrid from '../CropDimension/DimensionGrid';
import DimensionInput from '../CropDimension/DimensionInput';

const MarginsDimension = () => {
  const { t } = useTranslation();
  const { cropDimension } = useCropPanelContext();

  return (
    <>
      <DimensionGrid>
        <DimensionInput field="top" label={t('common.top')} value={cropDimension.top} />
        <DimensionInput field="bottom" label={t('common.bottom')} value={cropDimension.bottom} />
      </DimensionGrid>
      <DimensionGrid>
        <DimensionInput field="left" label={t('common.left')} value={cropDimension.left} />
        <DimensionInput field="right" label={t('common.right')} value={cropDimension.right} />
      </DimensionGrid>
    </>
  );
};

export default MarginsDimension;
