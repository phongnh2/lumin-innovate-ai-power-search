import { Button, TextInput } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Trans } from 'react-i18next';

import { useRequestUpgradeForm } from 'luminComponents/ProfileButton/hooks/useRequestUpgradeForm';

import { useTranslation } from 'hooks';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { MAX_LENGTH_REQUEST_UPGRADE_REASON } from 'constants/documentConstants';

import { IOrganization } from 'interfaces/organization/organization.interface';

import styles from './RequestUpgradeForm.module.scss';

function RequestUpgradeForm({ organization }: { organization: IOrganization }) {
  const { t } = useTranslation();
  const {
    form: {
      control,
      handleSubmit,
      formState: { errors, isValid, isSubmitting },
    },
    handlers: { handleSendRequest, handleCancel },
  } = useRequestUpgradeForm(organization._id);

  useEffect(() => {
    const modalEventData = {
      modalName: ModalName.SIGN_REQUEST_UPGRADE,
      modalPurpose: ModalPurpose[ModalName.SIGN_REQUEST_UPGRADE],
    };
    modalEvent.modalViewed(modalEventData).catch(() => {});
  }, []);

  return (
    <form onSubmit={handleSubmit(handleSendRequest)}>
      <div className={styles.container}>
        <p className={styles.description}>
          <Trans
            i18nKey="profileButton.requestUpgrade.message"
            values={{ orgName: organization.name }}
            components={{ b: <b className="kiwi-message--primary" /> }}
          />
        </p>

        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              error={errors.reason?.message}
              placeholder={t('profileButton.requestUpgrade.placeholder')}
              maxLength={MAX_LENGTH_REQUEST_UPGRADE_REASON}
              size="md"
              autoFocus
              clearable={false}
              className={styles.input}
            />
          )}
        />
      </div>

      <div className={styles.footer}>
        <Button size="lg" variant="outlined" onClick={handleCancel} disabled={isSubmitting} type="button">
          {t('common.cancel')}
        </Button>
        <Button size="lg" variant="filled" disabled={!isValid || isSubmitting} loading={isSubmitting} type="submit">
          {t('profileButton.requestUpgrade.sendRequest')}
        </Button>
      </div>
    </form>
  );
}

export default RequestUpgradeForm;
