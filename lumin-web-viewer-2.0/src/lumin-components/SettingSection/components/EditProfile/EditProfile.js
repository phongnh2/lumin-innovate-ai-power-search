import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { batch } from 'react-redux';
import { css } from 'styled-components';

import AvatarUploader from 'lumin-components/AvatarUploader';
import Alert from 'lumin-components/Shared/Alert';

import { useTabletMatch, useTranslation } from 'hooks';

import { avatar, file as fileUtils, toastUtils } from 'utils';
import errorInterceptor from 'utils/errorInterceptor';
import { mediaQuery } from 'utils/styles/mediaQuery';

import { maximumAvatarSize } from 'constants/customConstant';
import { ModalTypes } from 'constants/lumin-common';

import EditName from './EditName';
import * as ContainerStyled from '../../SettingSection.styled';
import Container from '../Container';

function EditProfile({
  title,
  defaultAvatar,
  maxSize,
  note,
  avatarRemoteId,
  defaultName,
  profileId,
  onUploadAvatar,
  onRemoveAvatar,
  onEditName,
}) {
  const { t } = useTranslation();
  const isTabletUp = useTabletMatch();
  const [fileUrl, setFileUrl] = useState(getAvatarUrl(avatarRemoteId));
  const [error, setError] = useState('');
  const [isUploading, setUploading] = useState(false);

  function getAvatarUrl(remoteId) {
    return avatar.getAvatar(remoteId);
  }

  const onChangeAvatar = async (file) => {
    try {
      const result = await fileUtils.fileReaderAsync(file);
      batch(() => {
        setFileUrl(result);
        setUploading(true);
        setError('');
      });
      const newTeam = await onUploadAvatar(profileId, file);
      batch(() => {
        setFileUrl(getAvatarUrl(newTeam.avatarRemoteId));
        setUploading(false);
      });
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('common.updateSuccessfully'),
      });
    } catch (e) {
      batch(() => {
        setFileUrl(getAvatarUrl(avatarRemoteId));
        setUploading(false);
        setError(errorInterceptor.getOrgErrorMessage(e));
      });
    }
  };
  const handleRemoveAvatar = async () => {
    try {
      batch(() => {
        setUploading(true);
        setError('');
      });
      await onRemoveAvatar(profileId);
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('common.updateSuccessfully'),
      });
      batch(() => {
        setFileUrl(null);
        setUploading(false);
      });
    } catch (e) {
      batch(() => {
        setUploading(false);
        setError(errorInterceptor.getOrgErrorMessage(e));
        setFileUrl(getAvatarUrl(avatarRemoteId));
      });
    }
  };
  const size = isTabletUp ? 80 : 64;
  return (
    <>
      {error && <Alert style={{ marginBottom: '16px' }}>{error}</Alert>}
      <Container
        title={title}
        css={css`
          ${mediaQuery.md`
            ${ContainerStyled.BodyContainer} {
              padding: 24px;
            }
          `}
        `}
      >
        {({ Divider }) => (
          <>
            <AvatarUploader
              avatarSource={fileUrl}
              defaultAvatar={defaultAvatar}
              size={size}
              onChange={onChangeAvatar}
              removeAvatar={handleRemoveAvatar}
              sizeLimit={maxSize}
              note={note}
              variant="circular"
              secondary
              hasBorder
              loading={isUploading}
              onError={setError}
              isLogo
            />
            <Divider />
            <EditName
              title={t('teamCommon.name')}
              onEditName={(name) => onEditName(profileId, name)}
              defaultName={defaultName}
              placeholder={t('common.eg', {
                egText: `Lumin ${t('team', { ns: 'terms' })}`,
              })}
            />
          </>
        )}
      </Container>
    </>
  );
}

EditProfile.propTypes = {
  title: PropTypes.node.isRequired,
  defaultAvatar: PropTypes.node.isRequired,
  maxSize: PropTypes.number,
  note: PropTypes.string.isRequired,
  avatarRemoteId: PropTypes.string,
  profileId: PropTypes.string.isRequired,
  onEditName: PropTypes.func.isRequired,
  onUploadAvatar: PropTypes.func.isRequired,
  onRemoveAvatar: PropTypes.func.isRequired,
  defaultName: PropTypes.string.isRequired,
};
EditProfile.defaultProps = {
  maxSize: maximumAvatarSize.ORGANIZATION,
  avatarRemoteId: null,
};

export default EditProfile;
