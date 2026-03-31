import { makeStyles } from '@mui/styles';
import { filter } from 'lodash';
import { Modal, Radio, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import RejectInvitationDark from 'assets/reskin/images/reject-invitation-dark.png';
import RejectInvitationLight from 'assets/reskin/images/reject-invitation-light.png';

import Dialog from 'lumin-components/Dialog';
import { CheckboxWithLabel } from 'lumin-components/Shared/Checkbox';
import SvgElement from 'lumin-components/SvgElement';

import { useEnableWebReskin, useGetImageByTheme, useTranslation } from 'hooks';

import orgTracking from 'services/awsTracking/organizationTracking';
import { rejectJoinedOrgInvitation, updateNotificationsCache } from 'services/graphServices/notification';

import logger from 'helpers/logger';

import { toastUtils, errorUtils } from 'utils';

import { NotificationTabs } from 'constants/notificationConstant';
import { ModalSize } from 'constants/styles/Modal';

import * as Styled from './DeclineInvitationModal.styled';

import styles from './DeclineInvitationModal.module.scss';

const useStyles = makeStyles({
  paper: {
    padding: 24,
  },
});

const DeclineInvitationModal = ({
  onCancel,
  invitationId,
  notificationId,
  orgId,
}) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const DeclineOptions = useMemo(
    () => [
      {
        text: t('common.reject'),
        value: 'NORMAL',
      },
      {
        text: t('notification.notificationInvite.rejectForever'),
        value: 'FOREVER',
      },
    ],
    [t]
  );
  const classes = useStyles();
  const { control, handleSubmit } = useForm({
    mode: 'onChange',
    defaultValues: {
      selectedList: DeclineOptions[0].value,
    },
  });

  const handleOnChange = ({ value, onChange }) => {
    onChange(value);
  };

  const submit = async (value) => {
    try {
      await rejectJoinedOrgInvitation({
        orgId,
        rejectType: value.selectedList,
        invitationId,
        notificationId,
      });
      orgTracking.trackUserRejectOrganizationInvitation({
        targetOrganizationId: orgId,
        organizationUserInvitationId: invitationId,
        rejectForever: value.selectedList === 'FOREVER',
      });
      toastUtils.success({
        message: t('notification.notificationInvite.invitationHasBeenRejected'),
      });
      updateNotificationsCache(
        (draft) => filter(draft, (item) => item._id !== notificationId),
        NotificationTabs.INVITES
      );
    } catch (err) {
      logger.logError({ message: err.message, error: err });
      errorUtils.handleScimBlockedError(err);
    }
    onCancel();
  };

  const imageSrc = useGetImageByTheme(RejectInvitationLight, RejectInvitationDark);

  if (isEnableReskin) {
    return (
      <Modal
        opened
        onClose={onCancel}
        titleCentered
        title={t('notification.notificationInvite.decliningThisInvitation')}
        Image={<img src={imageSrc} alt="Reject Invitation" style={{ height: '90px' }} />}
        onConfirm={handleSubmit(submit)}
        onCancel={onCancel}
        confirmButtonProps={{
          title: t('common.done'),
        }}
        cancelButtonProps={{
          title: t('common.cancel'),
        }}
        // TODO: remove this when notification popover is reskined
        zIndex="var(--zindex-modal-medium)"
      >
        <div className={styles.contentWrapper}>
          <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
            {t('notification.notificationInvite.thisActionCannotBeUndone')}
          </Text>
          <Controller
            name="selectedList"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) =>
              DeclineOptions.map((item) => (
                <div
                  key={item.value}
                  onClick={() => handleOnChange({ value: item.value, onChange })}
                  className={styles.radioGroup}
                  role="presentation"
                >
                  <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
                    {item.text}
                  </Text>
                  <Radio checked={value === item.value} classNames={{ radio: styles.radio }} />
                </div>
              ))
            }
          />
        </div>
      </Modal>
    );
  }

  return (
    <Dialog
      open
      classes={classes}
      onClose={onCancel}
      width={ModalSize.SM}
    >
      <Styled.DialogContent>
        <SvgElement
          content="icon-info"
          alt="Info"
          width={48}
          height={48}
        />
        <Styled.Title>{t('notification.notificationInvite.decliningThisInvitation')}</Styled.Title>
        <Styled.Desc>{t('notification.notificationInvite.thisActionCannotBeUndone')}</Styled.Desc>
        <Styled.CheckBoxContainer>
          <Controller
            name="selectedList"
            control={control}
            rules={{ required: true }}
            render={({
              field: { onChange, value },
            }) => DeclineOptions.map((item) => (
              <CheckboxWithLabel
                key={item.value}
                onChange={() => handleOnChange({ value: item.value, onChange })}
                checked={value === item.value}
                text={item.text}
              />
            ))}
          />
        </Styled.CheckBoxContainer>
        <Styled.ModalFooterCustom
          label={t('common.done')}
          onCancel={onCancel}
          onSubmit={handleSubmit(submit)}
        />
      </Styled.DialogContent>
    </Dialog>
  );
};

DeclineInvitationModal.propTypes = {
  invitationId: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  notificationId: PropTypes.string.isRequired,
  orgId: PropTypes.string.isRequired,
};

export default DeclineInvitationModal;
