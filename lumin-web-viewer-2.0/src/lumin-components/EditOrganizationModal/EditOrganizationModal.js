/* eslint-disable react/jsx-no-bind */
import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import AvatarUploader from 'lumin-components/AvatarUploader';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Dialog from 'lumin-components/Dialog';
import Icomoon from 'lumin-components/Icomoon';
import Input from 'lumin-components/Shared/Input';

import { useTabletMatch, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { validator, avatar, toastUtils } from 'utils';

import { maximumAvatarSize, UPLOAD_IMAGE_TYPES } from 'constants/customConstant';
import { ModalTypes } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import * as Styled from './EditOrganizationModal.styled';

const ICON_CLASS_NAME = {
  upload: 'upload-btn',
  remove: 'trash',
};

const propTypes = {
  open: PropTypes.bool,
  onSaved: PropTypes.func,
  onClose: PropTypes.func,
};

const defaultProps = {
  open: false,
  onSaved: () => { },
  onClose: () => { },
};

const EditOrganizationModal = ({
  open,
  onSaved,
  onClose,
}) => {
  const { t } = useTranslation();
  const [organization] = useSelector((state) => ([
    selectors.getCurrentOrganization(state),
  ]));
  const {
    _id: organizationId, avatarRemoteId, name, domain,
  } = organization.data || {};
  const defaultName = name || domain;
  const [uploading, setUploading] = useState(false);
  const [orgName, setOrgName] = useState(defaultName);
  const [validationError, setValidationError] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [file, setFile] = useState(avatar.getAvatar(avatarRemoteId));
  const [error, setError] = useState(null);
  const isTabletUp = useTabletMatch();

  const hasAvatarChanged = useRef(false);
  const hasInputChanged = useRef(false);
  const doNotChangeInfo = !hasAvatarChanged.current && !hasInputChanged.current;
  const isNewNameInValid = Boolean(validationError);
  const shouldDisableSave = uploading || doNotChangeInfo || isNewNameInValid;

  function changeAvatar(uploadedFile) {
    hasAvatarChanged.current = true;
    const reader = new FileReader();
    reader.readAsDataURL(uploadedFile);
    reader.onload = () => {
      unstable_batchedUpdates(() => {
        setFile(uploadedFile);
        setAvatarBase64(reader.result);
      });
    };
  }

  function removeAvatar() {
    hasAvatarChanged.current = true;
    unstable_batchedUpdates(() => {
      setAvatarBase64('');
      setFile('');
    });
  }

  async function handleUpdateAvatar() {
    if (file) {
      await organizationServices.changeAvatarOrganization({ orgId: organizationId, file });
    } else {
      await organizationServices.removeAvatarOrganization({ orgId: organizationId });
    }
  }

  async function handleOnSave() {
    try {
      unstable_batchedUpdates(() => {
        setUploading(true);
        setValidationError('');
      });

      if (hasAvatarChanged.current) {
        await handleUpdateAvatar();
      }

      await organizationServices.changeProfileOrganization({ orgId: organizationId, profile: { name: orgName } });
      onSaved();
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('common.updateSuccessfully'),
      });
    } catch (err) {
      logger.logError({ reason: 'Change organization info failed', error: err });
    } finally {
      setUploading(false);
    }
  }

  function handleChangeOrgName(e) {
    const currentName = e.target.value || '';
    const nameTrimmed = currentName.trim();
    const validatedOrgName = validator.validateOrgName(nameTrimmed);
    hasInputChanged.current = nameTrimmed !== defaultName;

    unstable_batchedUpdates(() => {
      setOrgName(currentName);
      setValidationError(validatedOrgName);
    });
  }

  function resetData() {
    unstable_batchedUpdates(() => {
      setFile(avatar.getAvatar(avatarRemoteId));
      setOrgName(defaultName);
      setAvatarBase64('');
      setValidationError('');
    });
    hasAvatarChanged.current = false;
    hasInputChanged.current = false;
  }

  return (
    <Dialog open={open || uploading} onClose={onClose} onExited={resetData} width={isTabletUp ? 528 : 328}>
      <Styled.Container>
        <Styled.Title>{t('memberPage.editOrg')}</Styled.Title>
        <Styled.Label>{t('memberPage.uploadOrgLogo')}</Styled.Label>
        <Styled.UploadAvatarWrapper>
          <AvatarUploader
            avatarSource={typeof file === 'string' ? file : avatarBase64}
            onChange={changeAvatar}
            removeAvatar={removeAvatar}
            sizeLimit={maximumAvatarSize.ORGANIZATION}
            error={error}
            onError={setError}
            note={t('common.limitSizeImage', { size: avatar.getAvatarFileSizeLimit(maximumAvatarSize.ORGANIZATION) })}
            defaultAvatar={<Icomoon className="default-org-2" size={40} color={Colors.NEUTRAL_60} />}
            secondary
            variant="circular"
            disabled={uploading}
            uploadType={UPLOAD_IMAGE_TYPES.LOGO}
            showInModal
            iconClassName={ICON_CLASS_NAME}
          />
        </Styled.UploadAvatarWrapper>
        <Styled.Label>{t('memberPage.orgInfoModal.orgName')}</Styled.Label>
        <Styled.InputWrapper>
          <Input
            onChange={handleChangeOrgName}
            value={orgName}
            placeholder={t('common.eg', { egText: 'Lisa B' })}
            errorMessage={validationError}
            showClearButton
            hideValidationIcon
            disabled={uploading}
          />
        </Styled.InputWrapper>
        <Styled.ButtonWrapper>
          <ButtonMaterial
            color={ButtonColor.TERTIARY}
            size={ButtonSize.XL}
            onClick={onClose}
            disabled={uploading}
          >
            {t('common.cancel')}
          </ButtonMaterial>
          <ButtonMaterial
            size={ButtonSize.XL}
            onClick={handleOnSave}
            disabled={shouldDisableSave}
            loading={uploading}
          >
            {t('common.save')}
          </ButtonMaterial>
        </Styled.ButtonWrapper>
      </Styled.Container>
    </Dialog>
  );
};

EditOrganizationModal.propTypes = propTypes;
EditOrganizationModal.defaultProps = defaultProps;

export default EditOrganizationModal;
