import { get } from 'lodash';
import { Badge, Button, Dialog, Divider, Text, Avatar, ModalTypes } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useRef, useState } from 'react';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import Loading from 'luminComponents/Loading';

import { useGetCurrentUser, useTrackingModalEvent, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { commonUtils, toastUtils, compressImage, hotjarUtils } from 'utils';

import { PROMPT_TO_UPLOAD_LOGO_TYPE } from 'features/CNC/constants/customConstant';
import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import { CNCModalName, CNCModalPurpose } from 'features/CNC/constants/events/modal';

import { maximumAvatarSize } from 'constants/customConstant';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { getAvatarUploadSizeError } from 'constants/messages';
import { supportedAvatarExtensions } from 'constants/supportedFiles';

import useHandleFetchAvatar from './hooks/useHandleFetchAvatar';
import { usePromptToUploadLogoStore } from './hooks/usePromptToUploadLogoStore';

import styles from './PromptToUploadLogoModal.module.scss';

type PromptToUploadLogoType = typeof PROMPT_TO_UPLOAD_LOGO_TYPE[keyof typeof PROMPT_TO_UPLOAD_LOGO_TYPE];
type PickerOpenSource = 'auto' | 'button' | null;

const PromptToUploadLogoModal = ({
  onChange,
  promptType,
}: {
  onChange: (file: File) => void;
  promptType: PromptToUploadLogoType;
}) => {
  const { isOpen, close, currentOrgToUpdateAvatar } = usePromptToUploadLogoStore();
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const suggestionAvatarRemoteId = get(
    currentOrgToUpdateAvatar,
    'metadata.avatarSuggestion.suggestionAvatarRemoteId',
    ''
  );
  const { trackModalViewed, trackModalConfirmation, trackModalDismiss } = useTrackingModalEvent({
    modalName: CNCModalName.PROMPT_AVATAR_SUGGESTION_MODAL,
    modalPurpose: CNCModalPurpose[CNCModalName.PROMPT_AVATAR_SUGGESTION_MODAL],
  });

  const pickerSourceRef = useRef<PickerOpenSource>(null);
  const pickerOpeningRef = useRef(false);

  const emailDomain = commonUtils.getDomainFromEmail(currentUser?.email || '');
  const [isFetchingAvatar, setIsFetchingAvatar] = useState(true);
  const [isLogoValid, setIsLogoValid] = useState(false);

  const { logoUrl, fetchAvatar } = useHandleFetchAvatar({
    emailDomain,
    suggestionAvatarRemoteId,
  });

  const openFilePicker = (source: PickerOpenSource) => {
    pickerSourceRef.current = source;
    pickerOpeningRef.current = true;

    if (inputRef.current) inputRef.current.value = '';
    inputRef.current?.click();
  };

  const handleCloseModal = () => {
    trackModalDismiss().catch(() => {});
    setError('');
    if (inputRef.current) inputRef.current.value = '';
    close();
  };

  useEffect(() => {
    if (!isOpen || isFetchingAvatar) return;

    if (isLogoValid) {
      trackModalViewed().catch(() => {});
      hotjarUtils.trackEvent(HOTJAR_EVENT.PROMPT_AVATAR_SUGGESTION_MODAL);
      return;
    }

    openFilePicker('auto');
  }, [isOpen, isFetchingAvatar, isLogoValid]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) return;

    const onPickerCancel = () => {
      if (pickerSourceRef.current === 'auto') {
        handleCloseModal();
      }
      pickerSourceRef.current = null;
      pickerOpeningRef.current = false;
    };

    inputElement.addEventListener('cancel', onPickerCancel);
    return () => inputElement.removeEventListener('cancel', onPickerCancel);
  }, [isOpen]);

  const applyAvatarSuggestion = async () => {
    try {
      setUploading(true);

      if (promptType === PROMPT_TO_UPLOAD_LOGO_TYPE.CREATE_ORG) {
        const result = await fetchAvatar();
        onChange(result);
      } else {
        await organizationServices.setAvatarFromSuggestion({ orgId: currentOrgToUpdateAvatar._id });
      }

      toastUtils
        .success({
          message: t('common.updateSuccessfully'),
        })
        .catch(() => {});

      trackModalConfirmation().catch(() => {});
      close();
    } catch (err) {
      toastUtils
        .error({
          message: (err as Error).message || t('common.somethingWentWrong'),
        })
        .catch(() => {});
    } finally {
      setUploading(false);
    }
  };

  const handleChangeAvatar = async (uploadedFile: File) => {
    setUploading(true);
    try {
      await organizationServices.changeAvatarOrganization({
        orgId: currentOrgToUpdateAvatar._id,
        file: uploadedFile,
      });

      toastUtils
        .openToastMulti({
          type: ModalTypes.success,
          message: t('common.updateSuccessfully'),
        })
        .catch(() => {});

      close();
    } catch (err) {
      toastUtils
        .openToastMulti({
          type: ModalTypes.error,
          message: t('common.somethingWentWrong'),
        })
        .catch(() => {});
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length === 0) return;

    pickerSourceRef.current = null;
    pickerOpeningRef.current = false;

    const inputFile = e.target.files?.[0];

    if (!supportedAvatarExtensions.includes(inputFile.type)) {
      if (inputRef.current) inputRef.current.value = '';
      setError(t('errorMessage.avatarInvalid'));
      return;
    }

    if (inputFile.size > maximumAvatarSize.ORGANIZATION) {
      if (inputRef.current) inputRef.current.value = '';
      setError(getAvatarUploadSizeError(maximumAvatarSize.ORGANIZATION));
      return;
    }

    const fileCompressed = await compressImage(inputFile, {
      mimeType: 'jpeg',
      convertSize: 0,
      maxWidth: 200,
      maxHeight: 500,
    });

    if (promptType === PROMPT_TO_UPLOAD_LOGO_TYPE.CREATE_ORG) {
      onChange(fileCompressed);
    } else {
      await handleChangeAvatar(fileCompressed);
    }

    if (inputRef.current) inputRef.current.value = '';
    close();
  };

  const renderInput = () => (
    <input
      type="file"
      style={{ display: 'none' }}
      accept="image/jpg, image/jpeg, image/png"
      ref={inputRef}
      onChange={handleInputChange}
    />
  );

  return (
    <>
      {renderInput()}
      <Dialog
        opened={isOpen}
        onClose={handleCloseModal}
        size="sm"
        withCloseButton
        headerTitle={t('createOrg.uploadWorkspaceAvatar')}
        closeOnClickOutside={false}
        headerTitleContainerProps={{ className: styles.headerTitle }}
      >
        <div className={styles.container}>
          <div className={styles.contentContainer}>
            <div className={styles.avatarContainer}>
              {isFetchingAvatar && (
                <div className={styles.avatarLoadingContainer}>
                  <Loading normal size={32} />
                </div>
              )}
              <div style={{ display: isFetchingAvatar ? 'none' : 'block' }}>
                <Avatar
                  src={logoUrl}
                  placeholder={<img src={DefaultOrgAvatar} alt="workspace avatar" />}
                  variant="outline"
                  size="xl"
                  onLoad={() => {
                    setIsLogoValid(true);
                    setIsFetchingAvatar(false);
                  }}
                  onError={() => {
                    setIsFetchingAvatar(false);
                  }}
                />
              </div>
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                {t('createOrg.descriptionFoundImage')}
              </Text>
            </div>
            <div className={styles.rightSection}>
              <Badge variant="blue" size="sm" className={styles.newBadge}>
                {t('createOrg.recommended')}
              </Badge>
              <Button variant="filled" size="md" onClick={applyAvatarSuggestion} loading={uploading}>
                {t('createOrg.applyNow')}
              </Button>
            </div>
          </div>

          <div className={styles.dividerContainer}>
            <Divider orientation="horizontal" h={1} w={200} />
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
              {t('common.or')}
            </Text>
            <Divider orientation="horizontal" h={1} w={200} />
          </div>

          <div className={styles.footerContainer}>
            <div className={styles.ctaContainer}>
              <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                {t('createOrg.uploadWorkspaceAvatarDescription')}
              </Text>
              <Button
                variant="outlined"
                size="md"
                className={styles.uploadButton}
                onClick={() => openFilePicker('button')}
                loading={uploading}
                data-lumin-btn-name={CNCButtonName.UPLOAD_AVATAR_FROM_DEVICE}
                data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.UPLOAD_AVATAR_FROM_DEVICE]}
              >
                {t('createOrg.uploadFromYourDevice')}
              </Button>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <Text type="body" size="md" color="var(--kiwi-colors-semantic-on-error-container)">
                  {error}
                </Text>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default React.memo(PromptToUploadLogoModal);
