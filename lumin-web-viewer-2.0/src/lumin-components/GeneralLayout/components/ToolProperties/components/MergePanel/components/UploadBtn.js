import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks';

import UploadPopover from './UploadPopover';

export const UploadBtn = () => {
  const { t } = useTranslation();
  return (
    <UploadPopover
      renderChildren={({ handleClick }) => (
        <Button
          startIcon={<Icomoon className="new_arrow_up" size={24} />}
          variant="outlined"
          onClick={handleClick}
          size="lg"
          data-cy="upload_file_button"
        >
          {t('viewer.leftPanelEditMode.uploadFile')}
        </Button>
      )}
    />
  );
};

export default UploadBtn;
