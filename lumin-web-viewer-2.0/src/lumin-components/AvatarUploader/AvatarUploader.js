import { Avatar, Button, Menu, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';
import DefaultTeamAvatar from 'assets/reskin/lumin-svgs/default-team-avatar.png';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import MaterialAvatar from 'lumin-components/MaterialAvatar';
import Icomoon from 'luminComponents/Icomoon';

import { useTabletMatch, useTrackFormEvent, useTranslation } from 'hooks';

import { avatar as avatarUtils, commonUtils, compressImage } from 'utils';

import { usePromptToUploadLogoStore } from 'features/CNC/CncComponents/PromptToUploadLogoModal/hooks/usePromptToUploadLogoStore';
import { PROMPT_TO_UPLOAD_LOGO_TYPE } from 'features/CNC/constants/customConstant';
import { CNCButtonName } from 'features/CNC/constants/events/button';

import { UPLOAD_IMAGE_TYPES } from 'constants/customConstant';
import { ModalTypes } from 'constants/lumin-common';
import { getAvatarUploadSizeError } from 'constants/messages';
import { Colors } from 'constants/styles';
import { supportedAvatarExtensions } from 'constants/supportedFiles';

import PopperUpload from './components/PopperUpload';

import {
  StyledContainer,
  StyledAvatar,
  StyledUploadContainer,
  StyledTitle,
  StyledNote,
  StyledButtonWrapper,
  StyledPopperButton,
  StyledUploadText,
  StyledEditText,
  StyledUploadButton,
} from './AvatarUploader.styled';

import styles from './AvatarUploader.module.scss';

const propTypes = {
  avatarSource: PropTypes.string,
  avatarBackgroundColor: PropTypes.string,
  disabled: PropTypes.bool,
  note: PropTypes.string,
  targetName: PropTypes.string,
  removeAvatar: PropTypes.func,
  onChange: PropTypes.func,
  openModal: PropTypes.func,
  sizeLimit: PropTypes.number,
  variant: PropTypes.string,
  title: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onError: PropTypes.func,
  team: PropTypes.bool,
  defaultAvatar: PropTypes.node,
  secondary: PropTypes.bool,
  size: PropTypes.number,
  inputName: PropTypes.string,
  showInModal: PropTypes.bool,
  uploadButtonWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  hasBorder: PropTypes.bool,
  uploadType: PropTypes.oneOf(Object.values(UPLOAD_IMAGE_TYPES)),
  iconClassName: PropTypes.object,
  isReskin: PropTypes.bool,
  hasOutline: PropTypes.bool,
  shouldPromptUpdateLogo: PropTypes.bool,
};

const defaultProps = {
  avatarSource: '',
  avatarBackgroundColor: '',
  disabled: false,
  note: '',
  targetName: '',
  removeAvatar: () => {},
  onChange: () => {},
  openModal: () => {},
  sizeLimit: 0,
  variant: 'circular',
  title: '',
  loading: false,
  error: null,
  onError: null,
  team: false,
  defaultAvatar: null,
  secondary: false,
  size: 72,
  inputName: '',
  showInModal: false,
  uploadButtonWidth: '',
  hasBorder: false,
  uploadType: UPLOAD_IMAGE_TYPES.PHOTO,
  iconClassName: {
    upload: 'upload-image',
    remove: 'trash',
  },
  isReskin: false,
  hasOutline: false,
  shouldPromptUpdateLogo: false,
};

const getTextButton = ({ uploadType, t }) => {
  switch (uploadType) {
    case UPLOAD_IMAGE_TYPES.LOGO:
      return {
        upload: t('common.uploadLogo'),
        edit: t('common.editLogo'),
      };
    case UPLOAD_IMAGE_TYPES.PHOTO:
      return {
        upload: t('common.uploadPhoto'),
        edit: t('common.editPhoto'),
      };
    default:
      return {
        upload: t('common.uploadThumbnail'),
        edit: t('common.editThumbnail'),
      };
  }
};

const AvatarUploader = (props) => {
  const {
    avatarSource,
    avatarBackgroundColor,
    disabled,
    note,
    targetName,
    removeAvatar,
    onChange,
    openModal,
    sizeLimit,
    variant,
    title,
    loading,
    error,
    onError,
    team,
    defaultAvatar,
    secondary,
    size,
    inputName,
    showInModal,
    uploadButtonWidth,
    uploadType,
    hasBorder,
    iconClassName,
    isReskin,
    hasOutline,
    shouldPromptUpdateLogo,
  } = props;
  const { t } = useTranslation();

  const inputRef = React.useRef(null);
  const { trackInputChange } = useTrackFormEvent();
  const isTabletMatch = useTabletMatch();
  const textButton = getTextButton({ uploadType, t });

  const { open: openPromptToUploadLogoModal, setCurrentOrgToUpdateAvatar } = usePromptToUploadLogoStore();

  const uploadButtonSize = isTabletMatch && !showInModal ? ButtonSize.MD : ButtonSize.XS;

  const removeCurrentAvatar = (e) => {
    if (inputName) {
      e.target.name = inputName;
      trackInputChange(e);
    }
    removeAvatar();
  };
  // eslint-disable-next-line react/prop-types
  const _renderPopperContent = ({ closePopper } = { closePopper: () => {} }) => (
    <PopperUpload
      closePopper={closePopper}
      inputRef={inputRef}
      removeAvatar={removeCurrentAvatar}
      uploadText={uploadType}
      iconClassName={iconClassName}
      isReskin={isReskin}
    />
  );

  const handleInputChange = async (e) => {
    trackInputChange(e);
    if (onError) {
      onError('');
    }
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!supportedAvatarExtensions.includes(file.type)) {
      e.target.value = '';
      if (onError) {
        onError(t('errorMessage.avatarInvalid'));
        return;
      }
      const modalSetting = {
        type: ModalTypes.ERROR,
        title: 'Error',
        message: t('errorMessage.avatarInvalid'),
        onConfirm: () => {},
      };
      openModal(modalSetting);
      inputRef.current.value = '';
      return;
    }
    if (file.size > sizeLimit) {
      e.target.value = '';
      if (onError) {
        onError(getAvatarUploadSizeError(sizeLimit));
      }
      return;
    }
    const fileCompressed = await compressImage(file, {
      mimeType: 'jpeg',
      convertSize: 0,
      maxWidth: 200,
      maxHeight: 500,
    });
    onChange(fileCompressed);
    inputRef.current.value = '';
  };

  const getButtonIconSize = () => {
    if (showInModal) {
      return 12;
    }
    return isTabletMatch ? 16 : 14;
  };

  const formatButtonText = (text) => commonUtils.formatTitleCaseByLocale(text);

  const renderButton = () => {
    if (avatarSource) {
      return (
        <StyledButtonWrapper>
          <StyledPopperButton
            popperProps={{ placement: 'bottom-start' }}
            renderPopperContent={_renderPopperContent}
            disabled={disabled || loading}
            $showInModal={showInModal}
            onClick={() => inputRef.current.click()}
          >
            <Icomoon className="edit-mode" size={getButtonIconSize()} color={Colors.NEUTRAL_100} />
            <StyledEditText $showInModal={showInModal}>{formatButtonText(textButton.edit)}</StyledEditText>
          </StyledPopperButton>
        </StyledButtonWrapper>
      );
    }

    return (
      <StyledUploadButton
        color={ButtonColor.SECONDARY_BLACK}
        size={uploadButtonSize}
        onClick={() => {
          if (shouldPromptUpdateLogo) {
            openPromptToUploadLogoModal({
              promptType: PROMPT_TO_UPLOAD_LOGO_TYPE.ORGANIZATION_SETTINGS,
              onChange,
            });
          } else {
            inputRef.current.click();
          }
        }}
        disabled={disabled || loading}
        width={uploadButtonWidth}
        $showInModal={showInModal}
        data-lumin-btn-name={shouldPromptUpdateLogo ? CNCButtonName.OPEN_SUGGESTION_MODAL_FROM_WS_SETTINGS : null}
      >
        <Icomoon className="upload-image" size={getButtonIconSize()} color={Colors.NEUTRAL_100} />
        <StyledUploadText $showInModal={showInModal}>{formatButtonText(textButton.upload)}</StyledUploadText>
      </StyledUploadButton>
    );
  };

  const renderButtonReskin = () => {
    if (avatarSource) {
      return (
        <Menu
          width={226}
          ComponentTarget={
            <Button variant="outlined" size="md">
              {formatButtonText(textButton.edit)}
            </Button>
          }
          position="bottom-start"
        >
          {_renderPopperContent({})}
        </Menu>
      );
    }
    return (
      <div className={styles.uploadButtonWrapper}>
        <Button
          variant="outlined"
          size="md"
          onClick={() => {
            if (shouldPromptUpdateLogo) {
              setCurrentOrgToUpdateAvatar({});
              openPromptToUploadLogoModal({
                promptType: PROMPT_TO_UPLOAD_LOGO_TYPE.CREATE_ORG,
                onChange,
              });
            } else {
              inputRef.current.click();
            }
          }}
          data-lumin-btn-name={shouldPromptUpdateLogo ? CNCButtonName.OPEN_SUGGESTION_MODAL_FROM_WS_CREATE : null}
          disabled={disabled}
        >
          {t('common.uploadPhoto')}
        </Button>
      </div>
    );
  };

  const renderInput = () => (
    <input
      name={inputName}
      type="file"
      id="file"
      ref={inputRef}
      style={{ display: 'none' }}
      accept="image/jpg, image/jpeg, image/png"
      onChange={handleInputChange}
    />
  );

  if (isReskin) {
    return (
      <div className={styles.container}>
        {renderInput()}
        <div className={hasOutline && styles.outline}>
          <Avatar
            size="xl"
            variant="outline"
            src={avatarSource || (team ? DefaultTeamAvatar : DefaultOrgAvatar)}
            loading={loading}
          />
        </div>
        <div>
          {renderButtonReskin()}
          {!title && (
            <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)" className={styles.note}>
              {note}
            </Text>
          )}
        </div>
      </div>
    );
  }

  return (
    <StyledContainer>
      {renderInput()}
      <StyledAvatar>
        <MaterialAvatar
          size={size}
          src={avatarSource}
          variant={variant}
          loading={loading}
          team={team}
          secondary={secondary}
          hasBorder={hasBorder}
          backgroundColor={avatarBackgroundColor}
        >
          {defaultAvatar || avatarUtils.getTextAvatar(targetName)}
        </MaterialAvatar>
      </StyledAvatar>
      <StyledUploadContainer>
        {title && <StyledTitle>{title}</StyledTitle>}
        {title && <StyledNote hasTitle={Boolean(title)}>{note}</StyledNote>}
        {renderButton()}
        {!title && (
          <StyledNote hasTitle={Boolean(title)} $showInModal={showInModal} $error={error}>
            {error || note}
          </StyledNote>
        )}
      </StyledUploadContainer>
    </StyledContainer>
  );
};

AvatarUploader.propTypes = propTypes;
AvatarUploader.defaultProps = defaultProps;

export default AvatarUploader;
