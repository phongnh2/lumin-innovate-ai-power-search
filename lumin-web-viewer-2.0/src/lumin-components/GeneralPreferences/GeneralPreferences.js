import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import { Trans } from 'react-i18next';
import { connect, shallowEqual, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import OfflineUpdateModal from 'lumin-components/OfflineUpdateModal';
import SelectDefaultWorkspaceModal from 'lumin-components/SelectDefaultWorkspaceModal';
import Switch from 'lumin-components/Shared/Switch';
import Tooltip from 'lumin-components/Shared/Tooltip';
import { ButtonChangeLanguagePreference } from 'luminComponents/ChangeLanguageButton';

import { cachingFileHandler, storageHandler } from 'HOC/OfflineStorageHOC';

import { useTranslation } from 'hooks';

import { canEnableOffline } from 'helpers/pwa';

import { toastUtils, bytesToSize, commonUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ModalTypes } from 'constants/lumin-common';
import { OFFLINE_STORAGE_ACTION, OFFLINE_STATUS } from 'constants/offlineConstant';
import { Colors } from 'constants/styles';

import AutoCompleteSection from './components/AutoCompleteSection';
import { useDefaultWorkspaceConfig } from './hooks';

import * as Styled from './GeneralPreferences.styled';

const GeneralPreferences = ({ currentUser, openModal }) => {
  const { t } = useTranslation();
  const { email, setting } = currentUser;
  const { defaultWorkspace } = setting || {};
  const { organization: orgWorkspace } =
    useSelector((state) => selectors.getOrganizationById(state, defaultWorkspace), shallowEqual) || {};

  const canEnableOfflineMode = canEnableOffline();

  const SETTING_UP_MESSAGE = t('common.settingUpOffline');
  const ENABLED_MESSAGE = t('settingGeneral.enabledMessage');
  const GET_STATUS_MESSAGE = t('settingGeneral.getStatus');

  const [offlineStatus, setOfflineStatus] = useState({
    version: '',
    shouldManualUpdate: false,
    disableOfflineMode: false,
    isEnableSwitch: false,
    status: GET_STATUS_MESSAGE,
    process: '',
  });
  const [downloadedProcess, setDownloadedProcess] = useState({ downloadedLength: 0, contentLength: 0 });

  const [isUpdating, setIsUpdating] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openSelectWorkspaceModal, setOpenSelectWorkspaceModal] = useState(false);

  const { visibility, tooltip } = useDefaultWorkspaceConfig();

  const downloadingHandler = (process) => {
    switch (process.action) {
      case OFFLINE_STORAGE_ACTION.SOURCE_CACHING:
        setOfflineStatus((prev) => ({ ...prev, process: SETTING_UP_MESSAGE }));
        break;
      case OFFLINE_STORAGE_ACTION.SOURCE_UPDATE:
        setIsUpdating(true);
        setOfflineStatus((prev) => ({
          ...prev,
          disableOfflineMode: true,
          process: SETTING_UP_MESSAGE,
        }));
        break;
      default:
        break;
    }
  };

  const updateOfflineStatus = () => {
    setOfflineStatus((prev) => ({
      ...prev,
      isEnableSwitch: false,
      process: '',
      version: '',
      shouldManualUpdate: false,
    }));
  };

  const defaultHandler = async (process) => {
    switch (process.action) {
      case OFFLINE_STORAGE_ACTION.SOURCE_CACHING:
        {
          const version = await cachingFileHandler.getCurrentOfflineVersion();
          toastUtils.openToastMulti({
            type: ModalTypes.SUCCESS,
            message: t('settingGeneral.offlineAccessHasBeenEnabled'),
          });
          setOfflineStatus((prev) => ({
            ...prev,
            isEnableSwitch: true,
            process: '',
            version: version.split('-')[1],
            shouldManualUpdate: false,
            status: ENABLED_MESSAGE,
          }));
        }
        break;
      case OFFLINE_STORAGE_ACTION.SOURCE_UPDATE:
        {
          const version = await cachingFileHandler.getCurrentOfflineVersion();
          setIsUpdating(false);
          setOfflineStatus((prev) => ({
            ...prev,
            process: '',
            version: version.split('-')[1],
            shouldManualUpdate: process.status === OFFLINE_STATUS.FAILED,
            disableOfflineMode: false,
            isEnableSwitch: true,
            status: ENABLED_MESSAGE,
          }));
          if (process.isManualUpdate) {
            toastUtils.openToastMulti({
              type: ModalTypes.SUCCESS,
              message: t('settingGeneral.updatesHaveBeenInstalled'),
            });
          }
        }
        break;
      case OFFLINE_STORAGE_ACTION.CLEAN_SOURCE:
        toastUtils.openToastMulti({
          type: ModalTypes.SUCCESS,
          message: t('settingGeneral.offlineAccessHasBeenDisabled'),
        });
        updateOfflineStatus();
        break;
      default:
        break;
    }
  };

  const messageHandler = async ({ process }) => {
    if (process.success) {
      switch (process.status) {
        case OFFLINE_STATUS.PENDING:
          setDownloadedProcess({ downloadedLength: process.downloadedLength, contentLength: process.contentLength });
          break;
        case OFFLINE_STATUS.DOWNLOADING:
          downloadingHandler(process);
          break;
        case OFFLINE_STATUS.ABORT:
          updateOfflineStatus();
          break;
        default:
          defaultHandler(process);
          break;
      }
    }
  };

  const handleDisableOffline = () => {
    toastUtils.openToastMulti({
      type: ModalTypes.INFO,
      message: t('settingGeneral.disablingOffline'),
    });
    setOfflineStatus((prev) => ({ ...prev, process: t('settingGeneral.disablingOfflineProcess') }));
    storageHandler.cleanSource();
  };

  useEffect(() => {
    const fetchOfflineStatus = async () => {
      const isOfflineProcessing = await cachingFileHandler.isOfflineProcessing();
      if (isOfflineProcessing) {
        setOfflineStatus((prev) => ({ ...prev, status: ENABLED_MESSAGE, process: SETTING_UP_MESSAGE }));
        return;
      }
      const [{ email: offlineEmail }, version, shouldManualUpdate] = await Promise.all([
        cachingFileHandler.getActiveOfflineUser(),
        cachingFileHandler.getCurrentOfflineVersion(),
        cachingFileHandler.shouldManualUpdate(),
      ]);
      if (!offlineEmail) {
        setOfflineStatus((prev) => ({ ...prev, status: ENABLED_MESSAGE, isEnableSwitch: false }));
        return;
      }
      if (email === offlineEmail) {
        setOfflineStatus((prev) => ({
          ...prev,
          status: ENABLED_MESSAGE,
          isEnableSwitch: true,
          version: version ? version.split('-')[1] : '',
          shouldManualUpdate,
        }));
      } else {
        setOfflineStatus({
          isEnableSwitch: false,
          disableOfflineMode: true,
          status: (
            <Trans i18nKey="settingGeneral.statusOffline">
              Another user <Styled.EmailOffline>{{ offlineEmail }}</Styled.EmailOffline> has already enabled offline
              access on this device.
              <br />
              Login and disable offline support on that account if you would like to use it on your current one.
            </Trans>
          ),
        });
      }
    };
    cachingFileHandler.subServiceWorkerHandler(messageHandler);
    fetchOfflineStatus();
    return () => {
      cachingFileHandler.unSubServiceWorkerHandler(messageHandler);
    };
  }, []);

  const onOfflineStatusChange = async (value) => {
    if (value) {
      toastUtils.openToastMulti({
        type: ModalTypes.INFO,
        message: SETTING_UP_MESSAGE,
      });
      setOfflineStatus((prev) => ({ ...prev, process: SETTING_UP_MESSAGE }));
      storageHandler.downloadSource();
    } else {
      const modalSettings = {
        type: ModalTypes.WARNING,
        title: t('settingGeneral.disableOfflineSupport'),
        message: t('settingGeneral.messageDisableOfflineSupport'),
        confirmButtonTitle: t('common.disable'),
        onCancel: () => {},
        onConfirm: () => handleDisableOffline(),
        confirmBtnElementName: ButtonName.DISABLE_OFFLINE,
      };
      openModal(modalSettings);
    }
  };

  const onUpdate = () => {
    setOpenUpdateModal(false);
    setIsUpdating(true);
    setOfflineStatus((prev) => ({
      ...prev,
      disableOfflineMode: true,
    }));
    toastUtils.openToastMulti({
      type: ModalTypes.INFO,
      message: t('settingGeneral.installingUpdates'),
    });
    storageHandler.updateSource({ manualUpdate: true });
  };

  const onLearnMoreClick = () => !offlineStatus.disableOfflineMode && setOpenUpdateModal(true);

  const onCloseUpdateModal = () => setOpenUpdateModal(false);

  const switchProps = !offlineStatus.isEnableSwitch ? { 'data-lumin-btn-name': ButtonName.ENABLE_OFFLINE } : {};

  const tooltipContent = (
    <Styled.TooltipContent>
      <Trans i18nKey="settingGeneral.tooltipOfflineSupport" components={{ br: <br /> }} />
    </Styled.TooltipContent>
  );

  const workspaceName = orgWorkspace?.name;

  const handleOpenSelectWorkspaceModal = useCallback(
    () => setOpenSelectWorkspaceModal(!openSelectWorkspaceModal),
    [openSelectWorkspaceModal]
  );

  const formatTitle = (text) => commonUtils.formatTitleCaseByLocale(text);

  const renderOfflineSection = () => {
    // remove this condition if you want display the Available offline feature
    if (!canEnableOfflineMode) {
      return null;
    }

    return (
      <>
        <Styled.Group className="joyride-highlightGeneral">
          <Styled.TitleContainer>
            <Styled.Title>{formatTitle(t('settingGeneral.offlineSupport'))}</Styled.Title>
            <Tooltip title={tooltipContent} placement="bottom-start" tooltipStyle={{ maxWidth: 385 }}>
              {/* @ts-ignore */}
              <Icomoon className="info" size={18} color={Colors.NEUTRAL_60} />
            </Tooltip>
          </Styled.TitleContainer>
          <Styled.Container>
            <div>
              <Styled.SubTitle>{offlineStatus.status}</Styled.SubTitle>
              {offlineStatus.process && (
                <>
                  <Styled.Status>{offlineStatus.process}</Styled.Status>
                  {Boolean(downloadedProcess.contentLength) && (
                    <Styled.SubTitle>
                      {t('common.sizeOfMaxSize', {
                        size: bytesToSize(downloadedProcess.downloadedLength),
                        maxSize: bytesToSize(downloadedProcess.contentLength),
                      })}
                    </Styled.SubTitle>
                  )}
                </>
              )}
            </div>
            <Tooltip
              title={!canEnableOfflineMode && t('settingGeneral.tooltipCanNotEnableOfflineMode')}
              placement="bottom-end"
            >
              <div>
                <Switch
                  disabled={Boolean(offlineStatus.process) || offlineStatus.disableOfflineMode || !canEnableOfflineMode}
                  checked={offlineStatus.isEnableSwitch}
                  onChange={(e) => onOfflineStatusChange(e.target.checked)}
                  value={String(offlineStatus.isEnableSwitch)}
                  {...switchProps}
                />
              </div>
            </Tooltip>
          </Styled.Container>
        </Styled.Group>
        {offlineStatus.isEnableSwitch && <Styled.Divider />}
        {offlineStatus.isEnableSwitch && (
          <Styled.Group>
            <Styled.Title>{formatTitle(t('settingGeneral.applicationUpdate'))}</Styled.Title>
            {offlineStatus.shouldManualUpdate ? (
              <Styled.UpdateContainer>
                <Styled.Button
                  onClick={onUpdate}
                  disabled={isUpdating}
                  data-lumin-btn-name={ButtonName.UPDATE_OFFLINE_SOURCE}
                >
                  {isUpdating ? t('settingGeneral.updating') : t('common.update')}
                </Styled.Button>
                <Styled.SubTitle>
                  <Trans i18nKey="settingGeneral.newVersionAvailable">
                    Your version is <Styled.BoldText>{{ version: offlineStatus.version }}</Styled.BoldText>
                    <br />A newer version is available. <Styled.Info onClick={onLearnMoreClick}>Learn more</Styled.Info>
                  </Trans>
                </Styled.SubTitle>
                <Styled.MessageWrapper>
                  <Icomoon className="info" color={Colors.SUCCESS_50} size={18} />
                  <Styled.Message>{t('settingGeneral.updateNewVersion')}</Styled.Message>
                </Styled.MessageWrapper>
              </Styled.UpdateContainer>
            ) : (
              <Styled.SubTitle>
                <Trans i18nKey="settingGeneral.updatedNewVersion">
                  Your version is <Styled.BoldText>{{ version: offlineStatus.version }}</Styled.BoldText>
                  <br />
                  You are up-to-date.
                </Trans>
              </Styled.SubTitle>
            )}
          </Styled.Group>
        )}
        <Styled.Divider />
      </>
    );
  };

  return (
    <>
      <ButtonChangeLanguagePreference />
      {visibility && (
        <>
          <Styled.Group>
            <Styled.TitleWrapper $workspaceName={workspaceName}>
              <Styled.TitleContainer>
                <Styled.Title>{formatTitle(t('settingGeneral.defaultWorkspace'))}</Styled.Title>
                <Tooltip title={tooltip} placement="bottom-start" tooltipStyle={{ maxWidth: 400 }}>
                  {/* @ts-ignore */}
                  <Icomoon className="info" size={18} color={Colors.NEUTRAL_60} />
                </Tooltip>
              </Styled.TitleContainer>
              {!workspaceName && (
                <Styled.Setting onClick={handleOpenSelectWorkspaceModal}>
                  {formatTitle(t('settingGeneral.setUpNow'))}
                </Styled.Setting>
              )}
              {workspaceName && (
                <Styled.Setting onClick={handleOpenSelectWorkspaceModal}>
                  {t('settingGeneral.changeWorkspace')}
                </Styled.Setting>
              )}
            </Styled.TitleWrapper>
            {workspaceName && (
              <Styled.WorkspaceNameContainer>
                <Styled.WorkspaceName>{workspaceName}</Styled.WorkspaceName>
              </Styled.WorkspaceNameContainer>
            )}
          </Styled.Group>
          <Styled.Divider />
        </>
      )}
      {renderOfflineSection()}
      <AutoCompleteSection />
      {openUpdateModal && <OfflineUpdateModal onClose={onCloseUpdateModal} onUpdate={onUpdate} />}
      {openSelectWorkspaceModal && (
        <SelectDefaultWorkspaceModal
          title={t('modalSelectDefaultWorkspace.title')}
          onCancel={() => setOpenSelectWorkspaceModal(!openSelectWorkspaceModal)}
          message={t('modalSelectDefaultWorkspace.updateWorkspace')}
          onSubmit={() => setOpenSelectWorkspaceModal(!openSelectWorkspaceModal)}
        />
      )}
    </>
  );
};

GeneralPreferences.defaultProps = {
  currentUser: {},
  disabled: false,
};

GeneralPreferences.propTypes = {
  currentUser: PropTypes.object,
  openModal: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSetting) => dispatch(actions.openModal(modalSetting)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GeneralPreferences);
