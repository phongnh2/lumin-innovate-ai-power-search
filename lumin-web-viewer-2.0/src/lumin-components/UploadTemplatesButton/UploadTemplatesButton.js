import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';
import PopperButton from 'lumin-components/PopperButton';
import { UploadDropZonePopper } from 'lumin-components/UploadDropZone';

import withUploadTemplate from 'HOC/withUploadTemplate';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { UPLOAD_FILE_TYPE, DOCUMENT_STORAGE } from 'constants/customConstant';
import { Colors } from 'constants/styles';

import * as Styled from './UploadTemplatesButton.styled';

const useStyles = makeStyles({
  popperButton: {
    background: Colors.SECONDARY_50,
    height: 44,
    padding: '0 16px',
    color: 'white',
    borderRadius: 8,
    width: 186,
    '&:hover': {
      background: Colors.SECONDARY_60,
    },
  },
});

const BUTTON_PROPS = {
  [DOCUMENT_STORAGE.google]: {
    'data-lumin-btn-name': ButtonName.TEMPLATE_UPLOAD_DRIVE,
  },
  [DOCUMENT_STORAGE.dropbox]: {
    'data-lumin-btn-name': ButtonName.TEMPLATE_UPLOAD_DROPBOX,
  },
  [DOCUMENT_STORAGE.s3]: {
    'data-lumin-btn-name': ButtonName.TEMPLATE_UPLOAD_DEVICE,
  },
};

function UploadTemplatesButton({
  onUploadFiles,
}) {
  const classes = useStyles();
  return (
    <PopperButton
      classes={classes.popperButton}
      popperProps={{ placement: 'bottom-end', scrollWillClosePopper: true }}
      renderPopperContent={({ closePopper }) => (
        <UploadDropZonePopper
          closePopper={closePopper}
          onUploadLuminFiles={onUploadFiles}
          uploadType={UPLOAD_FILE_TYPE.TEMPLATE}
          buttonProps={BUTTON_PROPS}
        />
      )}
    >
      <Icomoon className="plus-thin" size={16} />
      <Styled.Text>New template</Styled.Text>
      <Icomoon className="dropdown" size={12} />
    </PopperButton>
  );
}

UploadTemplatesButton.propTypes = {
  onUploadFiles: PropTypes.func.isRequired,
};
UploadTemplatesButton.defaultProps = {};

export default withUploadTemplate(UploadTemplatesButton);
