/* eslint-disable arrow-body-style */

import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import Menu, { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';

import { useTranslation } from 'hooks';

import { MergePanelContext } from '../MergePanel';

export const UploadPopoverContent = ({ handleClose }) => {
  const { t } = useTranslation();
  const { inputFileRef, googlePickerFileRef } = useContext(MergePanelContext);

  const onClickUploadFromLocal = () => {
    inputFileRef.current.click();
    handleClose();
  };

  const onClickUploadFromGoogleDrive = () => {
    googlePickerFileRef.current.click();
    handleClose();
  };

  return (
    <Menu style={{ width: 288 }}>
      <MenuItem size="medium" onClick={onClickUploadFromLocal} icon="new_computer">
        {t('viewer.leftPanelEditMode.fromYourComputer')}
      </MenuItem>
      <MenuItem size="medium" onClick={onClickUploadFromGoogleDrive} svgIcon="drive-up">
        {t('viewer.leftPanelEditMode.fromGoogleDrive')}
      </MenuItem>
    </Menu>
  );
};

UploadPopoverContent.propTypes = {
  handleClose: PropTypes.func.isRequired,
};

export default UploadPopoverContent;
