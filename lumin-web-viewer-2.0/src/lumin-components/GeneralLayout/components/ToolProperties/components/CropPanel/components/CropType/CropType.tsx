import { Select } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { CROP_TYPE_OPTIONS } from '../../constants';
import { useCropPanelContext } from '../../CropPanelContext';
import { CropTypeOption } from '../../types';

const CropType = () => {
  const { t } = useTranslation();
  const { cropType, setCropType } = useCropPanelContext();

  return (
    <Select
      withCheckIcon
      value={cropType}
      style={{ width: '100%' }}
      data={CROP_TYPE_OPTIONS.map(({ value, label }) => ({
        value,
        label: t(label),
      }))}
      onChange={(value) => setCropType(value as CropTypeOption)}
    />
  );
};

export default CropType;
