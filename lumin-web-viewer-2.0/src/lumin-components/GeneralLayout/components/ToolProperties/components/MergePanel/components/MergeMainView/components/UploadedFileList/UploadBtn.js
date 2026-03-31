/* eslint-disable import/no-cycle */
import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks/useTranslation';

import UploadPopover from '../../../UploadPopover';

export const UploadBtn = ({ wording = 'viewer.leftPanelEditMode.uploadFile' }) => {
  const { t } = useTranslation();

  return (
    <UploadPopover
      renderChildren={({ handleClick }) => (
        <Button
          startIcon={<Icomoon className="new_arrow_up" size={24} />}
          variant="outlined"
          onClick={handleClick}
          style={{ width: '100%' }}
          data-cy="upload_file_button"
        >
          {t(wording)}
        </Button>
      )}
    />
  );
};

UploadBtn.propTypes = {
  wording: PropTypes.string,
};

export default UploadBtn;
