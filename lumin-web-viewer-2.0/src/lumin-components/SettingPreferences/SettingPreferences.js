import {
  isEqual,
  throttle,
  merge,
  omitBy,
  isNil,
} from 'lodash';
import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ExportDataModal from 'lumin-components/ExportDataModal';
import Icomoon from 'lumin-components/Icomoon';
import Switch from 'lumin-components/Shared/Switch';

import { useTabletMatch, useTranslation } from 'hooks';

import { userServices } from 'services';

import logger from 'helpers/logger';

import { commonUtils, errorUtils, toastUtils } from 'utils';
import errorExtract from 'utils/error';

import { THROTTLE_DELAY_TIME, EMAIL_PREFERENCES, EMAIL_PREFERENCES_KEY } from 'constants/emailPreferenceConstant';
import { ModalTypes, LOGGER } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import { UPDATE_SETTING } from '../../graphql/UserGraph';

import {
  StyledWrapper,
  StyledContainer,
  StyledTitle,
  StyledGroup,
  StyledGroupTitle,
  StyledCheckboxWrapper,
  StyledCheckboxContainer,
  StyledCheckbox,
  StyledCheckboxContentWrapper,
  StyledCheckboxContent,
  StyledCheckboxDescription,
  StyledCheckboxNoti,
  StyledLink,
  StyledDataWrapper,
  StyledDataContainer,
  StyledButtonWrapper,
  StyledDataLabel,
  StyledDataDescription,
  StyledSwitchWrapper,
  StyledButtonDelete,
} from './SettingPreferences.styled';

const logEmailEvent = (key, value) => {
  if (key === EMAIL_PREFERENCES_KEY.MARKETING_EMAIL) {
    logger.logInfo({
      message: `${LOGGER.EVENT.PROMOTION_EMAIL}: ${value}`,
      reason: LOGGER.Service.LEGAL_OPT_INS,
    });
  } else {
    logger.logInfo({
      message: `${LOGGER.EVENT.FEATURE_UPDATE_EMAIL}: ${value}`,
      reason: LOGGER.Service.LEGAL_OPT_INS,
    });
  }
};
const SettingPreferences = (props) => {
  const { t } = useTranslation();
  const isTabletUp = useTabletMatch();

  const {
    client, currentUser, setCurrentUser, openModal, closeModal,
  } = props;
  const { setting } = currentUser;

  const [isDeletingData, setIsDeletingData] = useState(false);
  const [exportModalVisibility, setExportModalVisibility] = useState(false);

  const [emailSetting, setEmailSetting] = useState({ ...setting });
  const [isChanged, setIsChanged] = useState(false);

  const {
    marketingEmail = true,
    subscriptionEmail = true,
    otherEmail = true,
    featureUpdateEmail = true,
    dataCollection = true,
    documentEmail,
    organizationEmail,
  } = emailSetting;

  const {
    shareDocument = true,
    commentDocument = true,
    replyCommentDocument = true,
    mentionCommentDocument = true,
    requestAccessDocument = true,
  } = documentEmail || {};

  const { inviteToOrganization = true, inviteToOrganizationTeam = true } = organizationEmail || {};

  const previousMailChanged = useRef(null);

  const throttled = useCallback(throttle((cb) => cb(), THROTTLE_DELAY_TIME, { trailing: false }), []);

  const documentActivities = [
    {
      key: EMAIL_PREFERENCES_KEY.SHARE_DOCUMENT,
      value: shareDocument,
      content: t('settingPreferences.documentActivities.content1'),
    },
    {
      key: EMAIL_PREFERENCES_KEY.COMMENT_DOCUMENT,
      value: commentDocument,
      content: t('settingPreferences.documentActivities.content2'),
    },
    {
      key: EMAIL_PREFERENCES_KEY.REPLY_COMMENT_DOCUMENT,
      value: replyCommentDocument,
      content: t('settingPreferences.documentActivities.content3'),
    },
    {
      key: EMAIL_PREFERENCES_KEY.MENTION_COMMENT_DOCUMENT,
      value: mentionCommentDocument,
      content: t('settingPreferences.documentActivities.content4'),
    },
    {
      key: EMAIL_PREFERENCES_KEY.REQUEST_ACCESS_DOCUMENT,
      value: requestAccessDocument,
      content: t('settingPreferences.documentActivities.content5'),
    },
  ];

  const organizationActivities = [
    {
      key: EMAIL_PREFERENCES_KEY.INVITE_TO_ORGANIZATION,
      value: inviteToOrganization,
      content: t('settingPreferences.organizationActivities.content1'),
    },
    {
      key: EMAIL_PREFERENCES_KEY.INVITE_TO_ORGANIZATION_TEAM,
      value: inviteToOrganizationTeam,
      content: t('settingPreferences.organizationActivities.content2'),
    },
  ];

  const marketings = [
    {
      key: EMAIL_PREFERENCES_KEY.FEATURE_UPDATE_EMAIL,
      content: t('settingPreferences.marketings.content1'),
      description: t('settingPreferences.marketings.description1'),
      value: featureUpdateEmail,
    },
    {
      key: EMAIL_PREFERENCES_KEY.MARKETING_EMAIL,
      content: t('settingPreferences.marketings.content2'),
      description: t('settingPreferences.marketings.description2'),
      value: marketingEmail,
    },
  ];

  useEffect(() => {
    setIsChanged(!isEqual(emailSetting, setting));
  }, [emailSetting]);

  useEffect(() => {
    const saveChanges = () => {
      client.mutate({
        mutation: UPDATE_SETTING,
        variables: {
          input: {
            marketingEmail,
            subscriptionEmail,
            otherEmail,
            featureUpdateEmail,
            dataCollection,
            documentEmail: {
              shareDocument,
              commentDocument,
              replyCommentDocument,
              mentionCommentDocument,
              requestAccessDocument,
            },
            organizationEmail: {
              inviteToOrganization,
              inviteToOrganizationTeam,
            },
          },
        },
      }).then((response) => {
        const user = response.data.updateSetting;
        setCurrentUser({
          ...currentUser,
          ...omitBy(user, isNil),
        });
        setIsChanged(false);
        toastUtils.openToastMulti({
          message: t('errorMessage.settingUpdated'),
          type: ModalTypes.SUCCESS,
        });
      }).catch((error) => {
        errorUtils.handleUnknownError({ error, messageKey: 'settingPreferences.failedToSaveSetting', t });
        const { message: errorMessage } = errorExtract.extractGqlError(error);
        setEmailSetting(merge({}, emailSetting, previousMailChanged.current));
        previousMailChanged.current = null;
        logger.logError({
          message: errorMessage,
          error,
          reason: 'saveChanges',
        });
      });
    };

    if (isChanged) {
      saveChanges();
    }
  }, [isChanged]);

  const onExportDataPress = () => {
    setExportModalVisibility(true);
  };

  const deleteMarketingData = async () => {
    try {
      closeModal();
      setIsDeletingData(true);
      await userServices.deletePersonalData();
      toastUtils.openToastMulti({
        message: t('settingPreferences.yourDataWasFullyDeleted'),
        type: ModalTypes.SUCCESS,
      });
    } catch (error) {
      const { message: errorMessage } = errorExtract.extractGqlError(error);
      logger.logError({
        error,
        message: errorMessage,
        reason: 'deleteMarketingData',
      });
      toastUtils.openToastMulti({
        message: t('settingPreferences.errorDeleteYourData'),
        type: ModalTypes.ERROR,
      });
    } finally {
      setIsDeletingData(false);
    }
  };

  const openDeletedModal = () => {
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('settingPreferences.deleteYourMarketingData'),
      message: t('settingPreferences.thisActionCannotBeUndone'),
      confirmButtonTitle: t('common.delete'),
      color: 'accent',
      onCancel: () => closeModal(),
      onConfirm: deleteMarketingData,
    };
    openModal(modalSettings);
  };

  const handleToggle = ({ e, key, type }) => {
    let updateValue = {};
    switch (type) {
      case EMAIL_PREFERENCES.DOCUMENT_EMAIL:
        updateValue = {
          documentEmail: {
            ...emailSetting.documentEmail,
            [key]: e.target.checked,
          },
        };

        previousMailChanged.current = {
          documentEmail: {
            [key]: !e.target.checked,
          },
        };
        break;
      case EMAIL_PREFERENCES.ORGANIZATION_EMAIL: {
        updateValue = {
          organizationEmail: {
            ...emailSetting.organizationEmail,
            [key]: e.target.checked,
          },
        };
        previousMailChanged.current = {
          organizationEmail: {
            [key]: !e.target.checked,
          },
        };
        break;
      }
      case EMAIL_PREFERENCES.MARKETING_EMAIL:
        updateValue = {
          [key]: e.target.checked,
        };
        logEmailEvent(key, e.target.checked);
        previousMailChanged.current = {
          [key]: !e.target.checked,
        };
        break;
      default:
        updateValue = {
          [key]: e.target.checked,
        };
        previousMailChanged.current = {
          [key]: !e.target.checked,
        };
    }
    throttled(() => setEmailSetting({
      ...emailSetting,
      ...updateValue,
    }));
  };

  return (
    <StyledWrapper>
      <StyledContainer>
        <StyledTitle>{t('settingPreferences.emailNotifications')}</StyledTitle>
        <StyledGroup>
          <StyledGroupTitle>{t('settingPreferences.titleDocumentActivities')}</StyledGroupTitle>
          <StyledCheckboxWrapper>
            {documentActivities.map(({ key, content, value }) => (
              <StyledCheckboxContainer key={key}>
                <StyledCheckbox
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleToggle({ e, key, type: EMAIL_PREFERENCES.DOCUMENT_EMAIL })}
                />
                <StyledCheckboxContentWrapper>
                  <StyledCheckboxContent>{content}</StyledCheckboxContent>
                </StyledCheckboxContentWrapper>
              </StyledCheckboxContainer>
            ))}
          </StyledCheckboxWrapper>
        </StyledGroup>
        <StyledGroup>
          <StyledGroupTitle>{t('settingPreferences.orgActivities')}</StyledGroupTitle>
          <StyledCheckboxWrapper>
            {organizationActivities.map(({ key, content, value }) => (
              <StyledCheckboxContainer key={key}>
                <StyledCheckbox
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleToggle({ e, key, type: EMAIL_PREFERENCES.ORGANIZATION_EMAIL })}
                />
                <StyledCheckboxContentWrapper>
                  <StyledCheckboxContent>{content}</StyledCheckboxContent>
                </StyledCheckboxContentWrapper>
              </StyledCheckboxContainer>
            ))}
          </StyledCheckboxWrapper>
          <StyledCheckboxNoti>
            <Icomoon className="info org-noti-icon" size={18} color={Colors.SUCCESS_50} />
            <p>{t('settingPreferences.notiOrgActivities')}</p>
          </StyledCheckboxNoti>
        </StyledGroup>
        <StyledGroup>
          <StyledGroupTitle>{t('settingPreferences.marketing')}</StyledGroupTitle>
          <StyledCheckboxWrapper>
            {marketings.map(({
              key, content, description, value,
            }) => (
              <div key={key}>
                <StyledCheckboxContainer>
                  <StyledCheckbox
                    checked={value}
                    onChange={(e) => handleToggle({ e, key, type: EMAIL_PREFERENCES.MARKETING_EMAIL })}
                  />
                  <StyledCheckboxContentWrapper>
                    <StyledCheckboxContent isMarketing>{content}</StyledCheckboxContent>
                    {isTabletUp && <StyledCheckboxDescription>{description}</StyledCheckboxDescription>}
                  </StyledCheckboxContentWrapper>
                </StyledCheckboxContainer>
                {!isTabletUp && <StyledCheckboxDescription>{description}</StyledCheckboxDescription>}
              </div>
            ))}
          </StyledCheckboxWrapper>
          <StyledLink onClick={onExportDataPress}>{t('settingPreferences.exportYourDataLog')}</StyledLink>
        </StyledGroup>
        <StyledDataWrapper>
          <StyledTitle>{t('settingPreferences.data')}</StyledTitle>
          <StyledDataContainer>
            <div>
              <StyledDataLabel>{t('settingPreferences.dataCollection')}</StyledDataLabel>
              <StyledDataDescription>{t('settingPreferences.descDataCollection')}</StyledDataDescription>
            </div>
            <StyledSwitchWrapper>
              <Switch
                checked={dataCollection}
                onChange={(e) =>
                  handleToggle({
                    e,
                    key: EMAIL_PREFERENCES_KEY.DATA_COLLECTION,
                    type: EMAIL_PREFERENCES_KEY.DATA_COLLECTION,
                  })
                }
              />
            </StyledSwitchWrapper>
          </StyledDataContainer>
        </StyledDataWrapper>
        <StyledButtonWrapper>
          <StyledButtonDelete
            color={ButtonColor.TERTIARY}
            size={ButtonSize.XL}
            onClick={openDeletedModal}
            disabled={isDeletingData}
            loading={isDeletingData}
          >
            {commonUtils.formatTitleCaseByLocale(t('settingPreferences.deleteMyMarketingData'))}
          </StyledButtonDelete>
        </StyledButtonWrapper>
      </StyledContainer>
      <ExportDataModal
        open={exportModalVisibility}
        setOpen={setExportModalVisibility}
      />
    </StyledWrapper>
  );
};

SettingPreferences.defaultProps = {
  client: {},
  currentUser: {},
  setCurrentUser: () => {},
  openModal: () => {},
  closeModal: () => {},
};
SettingPreferences.propTypes = {
  client: PropTypes.object,
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func,
  openModal: PropTypes.func,
  closeModal: PropTypes.func,
};

export default SettingPreferences;
