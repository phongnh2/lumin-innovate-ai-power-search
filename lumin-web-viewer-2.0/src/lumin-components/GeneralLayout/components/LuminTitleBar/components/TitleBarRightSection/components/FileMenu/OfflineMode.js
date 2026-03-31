import React from 'react';

import selectors from 'selectors';

import { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';
import Switch from 'lumin-components/GeneralLayout/general-components/Switch';

import useShallowSelector from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

const OfflineMode = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { t } = useTranslation();
  const isLocalFile = currentDocument.isSystemFile;

  if (isLocalFile) {
    return null;
  }

  return (
    <MenuItem
      onClick={() => {}}
      icon="md_offline_active"
      renderSuffix={({ disabled }) => <Switch disabled={disabled} />}
    >
      {t('common.availableOffline')}
    </MenuItem>
  );
};

export default OfflineMode;
