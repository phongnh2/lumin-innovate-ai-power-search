import { css } from '@emotion/react';
import { Trans } from 'next-i18next';
import { ChangeEvent, useRef } from 'react';

import { ALLOW_IMAGE_MIMETYPE } from '@/constants/common';
import { ValidatorRule } from '@/constants/validator-rule';
import useTranslation from '@/hooks/useTranslation';
import { LoginService } from '@/interfaces/user';
import { AvatarSize, Avatar, Button, Dropdown, Menu, MenuItem, Text, Alert, Tooltip } from '@/ui';
import { ButtonColor, ButtonSize } from '@/ui/Button';

import { containerCss, infoContainerCss, validationMessageCss } from './ProfileAvatar.styled';

type ProfileAvatarProps = {
  className?: string;
  name: string;
  src?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  loading?: boolean;
  error?: string;
  disabledUpload?: boolean;
  loginService?: LoginService;
};
function ProfileAvatar({ className, src, name, onUpload, onRemove, loading, error, disabledUpload, loginService }: ProfileAvatarProps) {
  const { t } = useTranslation();
  const fileInput = useRef<HTMLInputElement>(null);

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) {
      return;
    }
    onUpload(file);
  };

  const onOpenUpload = () => {
    if (fileInput.current) {
      fileInput.current.value = '';
      fileInput.current.click();
    }
  };

  return (
    <>
      <Alert
        show={Boolean(error)}
        css={css`
          margin-bottom: 16px;
        `}
      >
        {error}
      </Alert>
      <article className={className} css={containerCss}>
        <Avatar src={src} name={name} size={{ mobile: AvatarSize.XL, tablet: AvatarSize.XXL }} />

        <div css={infoContainerCss}>
          <Tooltip title={loginService === LoginService.SAML_SSO && <Trans i18nKey='sso.notAllowedChangeUserInfo' components={{ b: <b /> }} />}>
            <div
              css={css`
                width: fit-content;
              `}
            >
              {!src ? (
                <Button
                  color={ButtonColor.SECONDARY_DARK}
                  size={{ mobile: ButtonSize.XS, tablet: ButtonSize.MD }}
                  css={css`
                    width: fit-content;
                  `}
                  onClick={onOpenUpload}
                  icon='upload-image'
                  loading={loading}
                  disabled={disabledUpload || loginService === LoginService.SAML_SSO}
                >
                  {t('profileAvatar.uploadPhoto')}
                </Button>
              ) : (
                <Dropdown
                  placement='bottom-start'
                  trigger={
                    <Button color={ButtonColor.SECONDARY_DARK} size={ButtonSize.MD} icon='edit-mode' loading={loading}>
                      {t('profileAvatar.editPhoto')}
                    </Button>
                  }
                  disabled={loginService === LoginService.SAML_SSO}
                >
                  {({ closePopper }) => (
                    <Menu closePopper={closePopper}>
                      <MenuItem closeOnDone icon='upload-image' onClick={onOpenUpload} label={t('profileAvatar.uploadAnotherUploadPhoto')} />
                      <MenuItem closeOnDone icon='trash' onClick={onRemove} label={t('profileAvatar.removeThisUploadPhoto')} />
                    </Menu>
                  )}
                </Dropdown>
              )}
            </div>
          </Tooltip>
          <Text variant='neutral' css={validationMessageCss}>
            <Trans i18nKey='profileAvatar.noteUploadAvatar' values={{ size: ValidatorRule.Avatar.MaximumAvatarSize / 1024 / 1024 }} />
          </Text>
        </div>

        <input ref={fileInput} type='file' accept={ALLOW_IMAGE_MIMETYPE.join(',')} onChange={onFileSelect} hidden />
      </article>
    </>
  );
}

export default ProfileAvatar;
