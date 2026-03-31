/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-no-bind */

// FIXME
/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable unused-imports/no-unused-vars */
import { Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useCallback, useContext, useEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Trans } from 'react-i18next';

import Alert from 'lumin-components/Shared/Alert';
import AvatarUploader from 'luminComponents/AvatarUploader';
import CircularLoading from 'luminComponents/CircularLoading';
import Icomoon from 'luminComponents/Icomoon';

import { WarningBannerContext } from 'HOC/withWarningBanner';

import { useNavigateUser, useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { organizationServices, loggerServices } from 'services';

import logger from 'helpers/logger';

import { avatar, toastUtils, file as fileUtils } from 'utils';
import errorExtract from 'utils/error';

import { usePromptToUploadLogoStore } from 'features/CNC/CncComponents/PromptToUploadLogoModal/hooks/usePromptToUploadLogoStore';
import { useGetPromptUpdateLogo } from 'features/CNC/hooks/useGetPromptUpdateLogo';

import { WarningBannerType } from 'constants/banner';
import { maximumAvatarSize } from 'constants/customConstant';
// import { WorkspaceTemplate } from 'constants/workspaceTemplate';
import { ErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_ROLES, ORGANIZATION_TEXT } from 'constants/organizationConstants';
import { PaymentTypes } from 'constants/plan';
import { Colors } from 'constants/styles';
import { WorkspaceTemplate } from 'constants/workspaceTemplate';

import ButtonDeleteOrganization from './components/ButtonDeleteOrganization';
import OrganizationSettingName from './components/OrganizationSettingName';
import { checkIsPreventDeleteOrganization } from './helpers';
import withDashboardWindowTitle from '../withDashboardWindowTitle';

import './OrganizationSettings.scss';
import styles from './OrganizationSettings.module.scss';

// FIX disable template feature
// const getTooltipSettingTemplate = (workspace, t) =>
//   t('orgSettings.tooltipSettingTemplate', {
//     text: workspace === WorkspaceTemplate.PERSONAL ? `this ${ORGANIZATION_TEXT}` : 'Personal workspace',
//   });

const OrganizationSettings = ({
  updateCurrentOrganization,
  currentOrganization,
  openModal,
  closeModal,
  openLoading,
  closeLoading,
}) => {
  const { t } = useTranslation();
  const { data: organization } = currentOrganization;
  // FIX disable template feature
  // const { templateWorkspace } = organization.settings;
  // const [stateSwitch, setStateSwitch] = useState(templateWorkspace);
  // const [loading, setLoading] = useState(false);
  const [isGettingExportFile, setIsGetting] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState('');
  const [file, setFile] = useState(avatar.getAvatar(organization.avatarRemoteId));
  const { goToOrgListOrPersonalDocs } = useNavigateUser();
  const bannerContextValue = useContext(WarningBannerContext);
  const { refetch: refetchBillingWarning } = bannerContextValue[WarningBannerType.BILLING_WARNING.value];
  const { shouldShowPromptUpdateLogo } = useGetPromptUpdateLogo({ currentOrganization: organization });
  const { setCurrentOrgToUpdateAvatar } = usePromptToUploadLogoStore();

  const { onKeyDown } = useKeyboardAccessibility();

  useEffect(() => {
    if (shouldShowPromptUpdateLogo) {
      setCurrentOrgToUpdateAvatar(organization);
    }
  }, [shouldShowPromptUpdateLogo]);

  useEffect(() => {
    if (organization?.avatarRemoteId) {
      setFile(avatar.getAvatar(organization.avatarRemoteId));
    }
  }, [organization?.avatarRemoteId]);

  const changeAvatar = async (fileUploaded) => {
    const prevFile = file;
    const result = await fileUtils.fileReaderAsync(fileUploaded);
    unstable_batchedUpdates(() => {
      setAvatarBase64(result);
      setFile(fileUploaded);
      setUploading(true);
      setError('');
    });
    try {
      const newAvatarRemoteId = await organizationServices.changeAvatarOrganization({
        orgId: organization._id,
        file: fileUploaded,
      });
      setFile(avatar.getAvatar(newAvatarRemoteId));
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('common.updateSuccessfully'),
      });
    } catch (err) {
      unstable_batchedUpdates(() => {
        setAvatarBase64('');
        setFile(prevFile);
      });
    } finally {
      setUploading(false);
    }
  };
  // FIX disable template feature
  // const handleSwitchTemplateWorkspace = async (orgId, value) => {
  //   setLoading(true);
  //   setStateSwitch(value ? WorkspaceTemplate.PERSONAL : WorkspaceTemplate.ORGANIZATION);
  //   const workspaceCloneTemplate = value ? WorkspaceTemplate.PERSONAL : WorkspaceTemplate.ORGANIZATION;
  //   const response = await organizationServices.updateOrgTemplateWorkspace({
  //     orgId,
  //     workspaceTemplate: workspaceCloneTemplate,
  //   });
  //   updateCurrentOrganization(response);
  //   setLoading(false);
  // };
  const removeAvatar = async () => {
    try {
      unstable_batchedUpdates(() => {
        setUploading(true);
        setError('');
      });
      await organizationServices.removeAvatarOrganization({ orgId: organization._id });
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('common.updateSuccessfully'),
      });
      unstable_batchedUpdates(() => {
        setAvatarBase64('');
        setFile('');
      });
    } finally {
      setUploading(false);
    }
  };
  const handleError = useCallback((message) => {
    setError(message);
  }, []);
  const onExportClick = async () => {
    try {
      setIsGetting(true);
      const { url } = await organizationServices.getExportDomainDownloadUrl(organization._id);
      await fileUtils.downloadFileFromUrl(url);
    } finally {
      setIsGetting(false);
    }
  };
  const handleDeleteOrganization = async () => {
    openLoading();
    try {
      await organizationServices.deleteOrganization(organization._id);
      const message = t('orgSettings.orgHasBeenDeactivated');
      toastUtils.openToastMulti({
        message,
        type: ModalTypes.SUCCESS,
      });
      goToOrgListOrPersonalDocs();
      refetchBillingWarning(organization._id, PaymentTypes.ORGANIZATION);
    } catch (err) {
      const { code } = errorExtract.extractGqlError(err);
      if (code === ErrorCode.Org.LAST_JOINED_ORGANIZATION) {
        toastUtils.error({
          message: t('orgSettings.tooltipDeleteLastJoinedOrg'),
        });
        return;
      }
      logger.logError({ error: err });
    } finally {
      closeLoading();
    }
  };
  const openDeletedModal = () => {
    if (checkIsPreventDeleteOrganization(organization)) {
      return;
    }
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('orgSettings.deactivateOrg'),
      message: (
        <Trans
          shouldUnescape
          i18nKey="orgSettings.messageDeactivateOrg"
          values={{ name: organization.name }}
          components={{ b: <b /> }}
        />
      ),
      confirmButtonTitle: t('orgSettings.deactivate'),
      onCancel: () => closeModal(),
      onConfirm: handleDeleteOrganization,
    };
    openModal(modalSettings);
  };
  const handleReactivateOrg = async () => {
    await organizationServices.reactiveOrganization(organization._id);
    refetchBillingWarning(organization._id, PaymentTypes.ORGANIZATION);
    toastUtils.openToastMulti({
      message: t('orgSettings.orgHasBeenReactivated'),
      type: ModalTypes.SUCCESS,
    });
  };

  return (
    <section className="OrganizationSettings__wrapper">
      <div className="OrganizationSettings__orgProfileContainer">
        {error && <Alert style={{ marginBottom: '16px' }}>{error}</Alert>}
        <h2 className="OrganizationSettings__title">{t('orgSettings.orgProfile')}</h2>
        <div className="OrganizationSettings__orgSettingContainer">
          <div className={styles.uploadLogoNoteWrapper}>
            {shouldShowPromptUpdateLogo && (
              <>
                <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)">
                  {t('createOrg.workspacePhoto')}
                </Text>
                <div className={styles.uploadLogoNote}>
                  <Text type="title" size="xs" color="var(--kiwi-colors-surface-on-surface)">
                    {t('createOrg.stillUsingDefaultAvatar')}
                  </Text>
                  <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface)">
                    {t('createOrg.uploadOfficialLogo')}
                  </Text>
                </div>
              </>
            )}
            <div className="OrganizationSettings__avatarUploadContainer">
              <AvatarUploader
                avatarSource={typeof file === 'string' ? file : avatarBase64}
                defaultAvatar={<Icomoon className="default-org-2" size={45} color={Colors.NEUTRAL_60} />}
                size={80}
                onChange={changeAvatar}
                removeAvatar={removeAvatar}
                sizeLimit={maximumAvatarSize.TEAM}
                note={t('orgSettings.uploadYourOrgLogo', {
                  size: avatar.getAvatarFileSizeLimit(maximumAvatarSize.TEAM),
                })}
                variant="circular"
                secondary
                hasBorder
                loading={uploading}
                onError={handleError}
                isLogo
                shouldPromptUpdateLogo={shouldShowPromptUpdateLogo}
              />
            </div>
          </div>
          <div className="OrganizationSettings__divider" />
          <OrganizationSettingName onError={handleError} />
        </div>
      </div>
      <div className="OrganizationSettings__orgDomainContainer">
        <h2 className="OrganizationSettings__title">{t('orgSettings.domainSettings')}</h2>
        <div className="OrganizationSettings__orgSettingContainer OrganizationSettings__orgSettingContainer--compactDomainContainer">
          <div className="OrganizationSettings__domainSettingWrapper">
            <div className="OrganizationSettings__domainSettingContainer">
              <h3 className="OrganizationSettings__domainSettingTitle">{t('orgSettings.domainExport')}</h3>
              <p className="OrganizationSettings__domainSettingText">{t('orgSettings.exportAllData')}</p>
            </div>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <span
              role="button"
              tabIndex={0}
              className="OrganizationSettings__domainSettingExportText"
              style={{ pointerEvents: isGettingExportFile ? 'none' : 'auto' }}
              onClick={onExportClick}
              onKeyDown={onKeyDown}
            >
              {isGettingExportFile ? <CircularLoading size={20} /> : t('orgSettings.exportAll')}
            </span>
          </div>
        </div>
      </div>
      {/* FIXME */}
      {/* <div className="OrganizationSettings__orgDomainContainer">
        <h2 className="OrganizationSettings__title">{t('orgSettings.templateSettings')}</h2>
        <div className="OrganizationSettings__orgSettingContainer OrganizationSettings__orgSettingContainer--compactDomainContainer">
          <div className="OrganizationSettings__domainSettingWrapper">
            <div className="OrganizationSettings__domainSettingContainer">
              <h3 className="OrganizationSettings__domainSettingTitle">{t('orgSettings.templateVisibility')}</h3>
              <p className="OrganizationSettings__domainSettingText">
                {t('orgSettings.orgTemplateWillBeCloned', {
                  orgText: capitalize(ORGANIZATION_TEXT),
                  text1:
                    stateSwitch === WorkspaceTemplate.PERSONAL
                      ? t('orgSettings.personalWorkspace')
                      : t('orgSettings.thisOrg', { orgText: ORGANIZATION_TEXT }),
                })}
              </p>
            </div>
            <Tooltip title={getTooltipSettingTemplate(stateSwitch)}>
              <div
                className={classnames('OrganizationSettings__settingTemplate', {
                  'OrganizationSettings__settingTemplate--disablePointEvent': loading,
                })}
              >
                <Switch
                  checked={stateSwitch === WorkspaceTemplate.PERSONAL}
                  onChange={(e) => handleSwitchTemplateWorkspace(organization._id, e.target.checked)}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div> */}
      {organization.userRole?.toUpperCase() === ORGANIZATION_ROLES.ORGANIZATION_ADMIN && (
        <div>
          <div className="OrganizationSettings__title">{t('orgSettings.deleteOrg')}</div>
          <div className="OrganizationSettings__orgSettingContainer OrganizationSettings__orgSettingContainer--compactDeleteContainer">
            <p className="OrganizationSettings__deleteOrganizationText">{t('orgSettings.deleteOrgDescription')}</p>
            <ButtonDeleteOrganization
              organization={organization}
              handleReactivateOrg={handleReactivateOrg}
              openDeletedModal={openDeletedModal}
            />
          </div>
        </div>
      )}
    </section>
  );
};

OrganizationSettings.propTypes = {
  currentOrganization: PropTypes.object,
  updateCurrentOrganization: PropTypes.func.isRequired,
  openModal: PropTypes.func,
  closeModal: PropTypes.func,
  openLoading: PropTypes.func,
  closeLoading: PropTypes.func,
};

OrganizationSettings.defaultProps = {
  currentOrganization: {},
  openModal: () => { },
  closeModal: () => { },
  openLoading: () => { },
  closeLoading: () => { },
};

export default withDashboardWindowTitle(OrganizationSettings, 'common.settings');
