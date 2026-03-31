import { merge } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { batch } from 'react-redux';

import AvatarUploader from 'luminComponents/AvatarUploader';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { validator, avatar, toastUtils, errorUtils } from 'utils';

import { maximumAvatarSize } from 'constants/customConstant';

import {
  StyledDialog,
  StyledDialogContainer,
  StyledDialogTitle,
  StyledDialogContent,
  StyledDialogError,
  StyledDialogFooter,
  StyledContentItem,
  StyledLabelWrapper,
  StyledLabel,
  StyledAvatarUploadContainer,
  StyledInput,
  StyledDivider,

} from './EditTeamModal.styled';

const propTypes = {
  team: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
};

const defaultProps = {
  team: {},
  open: false,
  onClose: () => {},
  onSaved: () => {},
};

function EditTeamModal({
  team,
  open,
  onClose,
  onSaved,
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [teamName, setTeamName] = useState(team.name);
  const [error, setError] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [file, setFile] = useState(avatar.getAvatar(team.avatarRemoteId));
  const [teamNameError, setTeamNameError] = useState('');
  const hasAvatarChanged = useRef(false);
  const hasInputChanged = useRef(false);

  const doNotChangeInfo = !hasAvatarChanged.current && !hasInputChanged.current;
  const shouldDisableSave = uploading || doNotChangeInfo || Boolean(validator.validateTeamName(teamName.trim()));

  const text = {
    uploadTeamLogo: t('teamCommon.uploadTeamPhoto'),
    name: t('teamCommon.name'),
    egText: t('common.eg', { egText: `Lumin ${t('team', { ns: 'terms' })}` }),
    edit: t('teamMember.editTeam'),
    successToast: t('teamListPage.teamInformationHasBeenUpdated'),
  };

  const _onSave = async () => {
    if (uploading) {
      return;
    }
    setUploading(true);
    try {
      const updatedTeam = await onSaveOrganizationTeam();
      onSaved(updatedTeam);
      toastUtils.success({
        message: text.successToast,
      });
      onClose();
    } catch (e) {
      const { code } = errorUtils.extractGqlError(e);
      errorUtils.handleCommonError({ errorCode: code, t });
      if (e.networkError) {
        setError(t('common.somethingWentWrong'));
      }
      setUploading(false);
    }
  };

  function getAvatarPayload() {
    if (!file) {
      return {
        team: {
          avatarRemoteId: '',
        },
      };
    }
    if (typeof file !== 'string') {
      return {
        file,
      };
    }
    return {};
  }

  async function onSaveOrganizationTeam() {
    const payload = {
      teamId: team._id,
      team: {
        name: teamName,
      },
    };
    return organizationServices.editOrganizationTeam(merge({}, payload, getAvatarPayload()));
  }

  const changeAvatar = (uploadedFile) => {
    hasAvatarChanged.current = true;
    const reader = new FileReader();
    reader.readAsDataURL(uploadedFile);
    reader.onload = () => batch(() => {
      setError('');
      setFile(uploadedFile);
      setAvatarBase64(reader.result);
    });
  };

  const removeAvatar = () => {
    hasAvatarChanged.current = true;
    return batch(() => {
      setError('');
      setAvatarBase64('');
      setFile(null);
    });
  };

  const onChangeTeamName = (event) => {
    const targetValue = event.currentTarget.value || '';
    const currentTeamName = targetValue.trim();
    hasInputChanged.current = targetValue !== team.name;

    return batch(() => {
      setError('');
      setTeamName(targetValue);
      setTeamNameError(validator.validateTeamName(currentTeamName));
    });
  };

  const resetData = () => {
    batch(() => {
      setFile(avatar.getAvatar(team.avatarRemoteId));
      setTeamName(team.name);
      setAvatarBase64('');
      setTeamNameError('');
      setError('');
    });
    hasAvatarChanged.current = false;
    hasInputChanged.current = false;
  };

  const uploadteamPictureElement = (
    <StyledContentItem>
      <StyledLabelWrapper>
        <StyledLabel>{text.uploadTeamLogo}</StyledLabel>
      </StyledLabelWrapper>
      <StyledAvatarUploadContainer
        teamNameEmpty={!teamName}
      >
        <AvatarUploader
          avatarSource={typeof file === 'string' ? file : avatarBase64}
          targetName={teamName}
          onChange={changeAvatar}
          removeAvatar={removeAvatar}
          sizeLimit={maximumAvatarSize.TEAM}
          note={t('common.limitSizeImage', { size: avatar.getAvatarFileSizeLimit(maximumAvatarSize.TEAM) })}
          onError={setError}
          team
          size={64}
          isLogo
          showInModal
        />
      </StyledAvatarUploadContainer>
    </StyledContentItem>
  );

  const teamNameElement = (
    <StyledContentItem>
      <StyledInput
        label={text.name}
        onChange={onChangeTeamName}
        onBlur={onChangeTeamName}
        placeholder={text.egText}
        value={teamName}
        errorMessage={teamNameError}
        showClearButton
        hideValidationIcon
        disabled={uploading}
        classWrapper="EditTeamModal__inputName"
        autoFocus
      />
    </StyledContentItem>
  );

  return (
    <StyledDialog
      open={open}
      onExited={resetData}
      onClose={onClose}
      width={528}
      scroll="body"
    >
      <StyledDialogContainer>
        <StyledDialogTitle>{text.edit}</StyledDialogTitle>
        <StyledDialogContent>
          {error && (
            <StyledDialogError>
              {error}
            </StyledDialogError>
          )}

          {uploadteamPictureElement}

          {teamNameElement}

          <StyledDivider />

          <StyledDialogFooter
            onCancel={onClose}
            disabledCancel={uploading}
            disabled={shouldDisableSave}
            loading={uploading}
            onSubmit={_onSave}
            label={t('common.save')}
          />
        </StyledDialogContent>
      </StyledDialogContainer>
    </StyledDialog>
  );
}

EditTeamModal.propTypes = propTypes;
EditTeamModal.defaultProps = defaultProps;

export default EditTeamModal;
