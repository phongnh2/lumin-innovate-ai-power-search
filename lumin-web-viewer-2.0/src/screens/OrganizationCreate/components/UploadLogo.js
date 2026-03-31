import { Text } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import AvatarUploader from 'luminComponents/AvatarUploader';
import Icomoon from 'luminComponents/Icomoon';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { avatar } from 'utils';
import { FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';

import { useGetPromptUpdateLogo } from 'features/CNC/hooks';

import { maximumAvatarSize } from 'constants/customConstant';
import { Colors } from 'constants/styles';

import { OrganizationCreateContext } from '../OrganizationCreate.context';
import styles from '../OrganizationCreate.module.scss';
import { StyledItem, StyledItemContent } from '../OrganizationCreate.styled';

const UploadLogo = () => {
  const { state, setState } = useContext(OrganizationCreateContext);
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const { isOn } = useGetPromptUpdateLogo({ currentOrganization: {} });
  const shouldPromptUpdateLogo = isOn && !state.file;
  const setError = (newError) => setState({ error: newError });

  const changeAvatar = (uploadFile) => {
    setError('');
    const reader = new FileReader();
    reader.readAsDataURL(uploadFile);
    reader.onload = () => {
      setState({
        file: uploadFile,
        avatarBase64: reader.result,
      });
    };
  };

  const removeAvatar = () => setState({ file: '', avatarBase64: '', error: '' });

  if (isEnableReskin) {
    return (
      <div className={styles.avatarSection}>
        <Text type="title" size="sm">
          {t('createOrg.uploadOrgPhoto')}
        </Text>
        <AvatarUploader
          inputName={FORM_INPUT_NAME.ORGANIZATION_AVATAR}
          disabled={state.isCreating}
          avatarSource={state.file ? state.avatarBase64 : null}
          onChange={changeAvatar}
          removeAvatar={removeAvatar}
          sizeLimit={maximumAvatarSize.ORGANIZATION}
          note={t('common.limitSizeImage', { size: avatar.getAvatarFileSizeLimit(maximumAvatarSize.ORGANIZATION) })}
          onError={setError}
          isReskin
          hasOutline={state.updatedWorkspaceName && !state.file}
          shouldPromptUpdateLogo={isOn}
        />
        {shouldPromptUpdateLogo && (
          <div className={styles.logoNote}>
            <Text type="body" size="sm" color="var(--kiwi-colors-semantic-on-information-container)">
              {t('createOrg.logoNote')}
            </Text>
          </div>
        )}
      </div>
    );
  }

  return (
    <StyledItem itemUpload>
      <StyledItemContent>
        <AvatarUploader
          inputName={FORM_INPUT_NAME.ORGANIZATION_AVATAR}
          disabled={state.isCreating}
          avatarSource={state.file ? state.avatarBase64 : null}
          onChange={changeAvatar}
          removeAvatar={removeAvatar}
          sizeLimit={maximumAvatarSize.ORGANIZATION}
          note={t('common.limitSizeImage', { size: avatar.getAvatarFileSizeLimit(maximumAvatarSize.ORGANIZATION) })}
          onError={setError}
          variant="circular"
          defaultAvatar={<Icomoon color={Colors.NEUTRAL_60} className="default-org-2" size={40} />}
          secondary
          isLogo
        />
      </StyledItemContent>
    </StyledItem>
  );
};

export default UploadLogo;
