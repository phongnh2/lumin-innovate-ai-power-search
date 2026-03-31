import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { useCropPanelContext } from '../../CropPanelContext';
import DimensionGrid from '../CropDimension/DimensionGrid';
import DimensionInput from '../CropDimension/DimensionInput';

const PageBoxDimension = () => {
  const { t } = useTranslation();
  const { cropDimension } = useCropPanelContext();

  return (
    <>
      <DimensionGrid>
        <DimensionInput field="width" label={t('common.width')} value={cropDimension.width} />
        <DimensionInput field="height" label={t('common.height')} value={cropDimension.height} />
      </DimensionGrid>
      <DimensionGrid>
        <DimensionInput
          field="left"
          label={t('viewer.cropPanel.cropDimension.fromLeft')}
          labelWithUnit={false}
          value={cropDimension.left}
        />
        <DimensionInput
          field="top"
          label={t('viewer.cropPanel.cropDimension.fromTop')}
          labelWithUnit={false}
          value={cropDimension.top}
        />
      </DimensionGrid>
    </>
  );
};

export default PageBoxDimension;
