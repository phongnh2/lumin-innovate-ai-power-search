import React from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import copyText from 'helpers/copyText';

import DataElements from 'constants/dataElement';

const CopyText = () => {
  const { t } = useTranslation();
  return (
    <IconButton
      data-element={DataElements.COPY_TEXT_BUTTON}
      icon="md_copy"
      iconSize={24}
      onClick={copyText}
      tooltipData={{ location: 'bottom', title: t('action.copy') }}
    />
  );
};

export default CopyText;
