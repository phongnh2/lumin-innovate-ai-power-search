import { MenuItem } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks';

import { UPLOAD_IMAGE_TYPES } from 'constants/customConstant';
import { Colors } from 'constants/styles';

import { StyledList, StyledItem, StyledActionName } from './PopperUpload.styled';

const propTypes = {
  inputRef: PropTypes.object,
  closePopper: PropTypes.func,
  removeAvatar: PropTypes.func,
  uploadText: PropTypes.string,
  iconClassName: PropTypes.object,
  isReskin: PropTypes.bool,
};

const defaultProps = {
  inputRef: null,
  closePopper: () => {},
  removeAvatar: () => {},
  uploadText: 'Logo',
  iconClassName: {},
  isReskin: false,
};

const PopperUpload = ({ inputRef, closePopper, removeAvatar, uploadText, iconClassName, isReskin }) => {
  const { t } = useTranslation();

  const getTextButton = () => {
    switch (uploadText) {
      case UPLOAD_IMAGE_TYPES.LOGO:
        return {
          upload: t('common.uploadAnotherUploadLogo'),
          edit: t('common.removeThisUploadLogo'),
        };
      case UPLOAD_IMAGE_TYPES.PHOTO:
        return {
          upload: t('common.uploadAnotherUploadPhoto'),
          edit: t('common.removeThisUploadPhoto'),
        };
      default:
        return {
          upload: t('common.uploadAnotherUploadThumbnail'),
          edit: t('common.removeThisUploadThumbnail'),
        };
    }
  };

  if (isReskin) {
    return (
      <>
        <MenuItem
          leftIconProps={{ type: 'image-md' }}
          onClick={() => {
            inputRef.current.click();
          }}
        >
          {getTextButton().upload}
        </MenuItem>
        <MenuItem
          leftIconProps={{ type: 'trash-md' }}
          onClick={(e) => {
            removeAvatar(e);
          }}
        >
          {getTextButton().edit}
        </MenuItem>
      </>
    );
  }

  return (
    <StyledList>
      <StyledItem
        onClick={() => {
          inputRef.current.click();
          closePopper();
        }}
      >
        <Icomoon className={iconClassName.upload} color={Colors.NEUTRAL_80} />
        <StyledActionName>{getTextButton().upload}</StyledActionName>
      </StyledItem>
      <StyledItem
        onClick={(e) => {
          removeAvatar(e);
          closePopper();
        }}
      >
        <Icomoon className={iconClassName.remove} color={Colors.NEUTRAL_80} />
        <StyledActionName>{getTextButton().edit}</StyledActionName>
      </StyledItem>
    </StyledList>
  );
};

PopperUpload.propTypes = propTypes;
PopperUpload.defaultProps = defaultProps;

export default PopperUpload;
