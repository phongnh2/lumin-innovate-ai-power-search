import { isEmpty } from 'lodash';
import { Avatar, AvatarGroup, Button, Modal, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import styles from '@web-new-ui/components/DocumentInfoModal/DocumentInfoModal.module.scss';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import Skeleton from 'lumin-components/Shared/Skeleton';
import OrgNameAndPlanInfo from 'luminComponents/OrgNameAndPlanInfo';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { avatar, dateUtil } from 'utils';

import { usePromptToUploadLogoStore } from 'features/CNC/CncComponents/PromptToUploadLogoModal/hooks/usePromptToUploadLogoStore';
import { PROMPT_TO_UPLOAD_LOGO_TYPE } from 'features/CNC/constants/customConstant';
import { CNCButtonName } from 'features/CNC/constants/events/button';
import { useGetPromptUpdateLogo } from 'features/CNC/hooks';

import planStyles from './OrganizationInfoModal.module.scss';

const propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  currentOrganization: PropTypes.object,
};

const defaultProps = {
  open: false,
  onClose: () => {},
  currentOrganization: {},
};

const MAX_MEMBER = 4;
function OrganizationInfoModal(props) {
  const { t } = useTranslation();
  const { open, onClose, currentOrganization } = props;
  const [currentOrgInfo, setCurrentOrgInfo] = useState({});
  const { totalMember, members, name, domain, owner = {}, createdAt, payment = {} } = currentOrgInfo;
  const { open: openPromptToUploadLogoModal, setCurrentOrgToUpdateAvatar } = usePromptToUploadLogoStore();

  const { shouldShowPromptUpdateLogo } = useGetPromptUpdateLogo({ currentOrganization: currentOrganization?.data });

  useEffect(() => {
    const fetchingOrgInfo = async () => {
      try {
        const response = await organizationServices.getOrgInfo({ orgId: currentOrganization.data._id });
        setCurrentOrgInfo(response?.orgData);
      } catch (error) {
        logger.logError({ error });
      }
    };
    fetchingOrgInfo();
    return () => {
      setCurrentOrgInfo({});
    };
  }, [currentOrganization.data._id]);

  const getPaymentDetail = ({ type }) => {
    if (!type) {
      return null;
    }
    return (
      <OrgNameAndPlanInfo
        organization={currentOrganization.data}
        displayOrgInfo={false}
        planProps={{ className: planStyles.planDescription }}
      />
    );
  };

  const handleOpenPromptToUploadLogoModal = useCallback(() => {
    setCurrentOrgToUpdateAvatar(currentOrganization.data);
    openPromptToUploadLogoModal({
      promptType: PROMPT_TO_UPLOAD_LOGO_TYPE.ORGANIZATION_SETTINGS,
      onChange: () => {},
    });
    onClose();
  }, [currentOrganization.data._id]);

  const renderOrgSize = useCallback(
    () => (
      <div className={styles.membersSize}>
        <AvatarGroup
          size="xs"
          max={MAX_MEMBER + 1}
          variant="outline"
          propsItems={members.map((member) => ({
            src: member.avatarRemoteId ? avatar.getAvatar(member.avatarRemoteId) : '',
            name: member.name,
          }))}
          renderItem={(props) => <Avatar {...props} />}
        />
        {totalMember} {t('common.memberS').toLocaleLowerCase()}
      </div>
    ),
    [members, totalMember]
  );

  const modalData = useMemo(
    () =>
      !isEmpty(currentOrgInfo) && [
        [
          {
            key: 'orgName',
            field: t('memberPage.orgInfoModal.orgName'),
            value: name || domain,
          },
          {
            key: 'creator',
            field: t('modal.creator'),
            value: owner.name,
          },
          {
            key: 'creationDate',
            field: t('modal.creationDate'),
            value: createdAt && dateUtil.formatMDYTime(createdAt),
          },
        ],
        [
          {
            key: 'orgPlan',
            field: t('memberPage.orgInfoModal.orgPlan'),
            value: getPaymentDetail(payment),
          },
          {
            key: 'orgSize',
            field: t('memberPage.orgInfoModal.orgSize'),
            value: renderOrgSize(),
          },
        ],
      ],
    [currentOrgInfo, currentOrganization.data]
  );

  return (
    <Modal
      title={t('common.orgInfo')}
      type="info"
      opened={open}
      onClose={onClose}
      centered
      onConfirm={onClose}
      confirmButtonProps={{ title: t('action.close') }}
    >
      {shouldShowPromptUpdateLogo && (
        <div className={planStyles.uploadLogoNote}>
          <div className={planStyles.uploadLogoContent}>
            <Text type="title" size="xs" color="var(--kiwi-colors-surface-on-surface)">
              {t('createOrg.stillUsingDefaultAvatar')}
            </Text>
            <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface)">
              {t('createOrg.uploadOfficialLogo')}
            </Text>
          </div>
          <div className={planStyles.uploadLogoButton}>
            <Avatar src={DefaultOrgAvatar} size="lg" />
            <Button
              variant="outlined"
              size="sm"
              onClick={handleOpenPromptToUploadLogoModal}
              data-lumin-btn-name={CNCButtonName.OPEN_SUGGESTION_MODAL_FROM_WS_INFO_MODAL}
            >
              {t('common.uploadLogo')}
            </Button>
          </div>
        </div>
      )}
      {isEmpty(currentOrgInfo)
        ? [Array.from(Array(3)), Array.from(Array(2))].map((section, index) => (
            <div className={styles.blockWrapper} key={index}>
              {section.map((_, i) => (
                <div key={i} className={styles.itemWrapper}>
                  <Skeleton width="100px" height="20px" />
                  <Skeleton width="120px" height="20px" />
                </div>
              ))}
            </div>
          ))
        : modalData.map((section, index) => (
            <div className={styles.blockWrapper} key={index}>
              {section.map((item) => (
                <div key={item.key} className={styles.itemWrapper}>
                  <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
                    {item.field}
                  </Text>
                  {item.key === 'orgPlan' ? (
                    item.value
                  ) : (
                    <Text
                      type="body"
                      size="md"
                      color="var(--kiwi-colors-surface-on-surface)"
                      component="div"
                      className={styles.textValue}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {item.value}
                    </Text>
                  )}
                </div>
              ))}
            </div>
          ))}
    </Modal>
  );
}

OrganizationInfoModal.propTypes = propTypes;
OrganizationInfoModal.defaultProps = defaultProps;

export default OrganizationInfoModal;
