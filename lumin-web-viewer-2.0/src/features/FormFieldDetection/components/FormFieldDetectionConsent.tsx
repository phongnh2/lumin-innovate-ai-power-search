import { Button } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { AnyAction } from 'redux';

import CheckboxV2 from '@new-ui/general-components/Checkbox';

import actions from 'actions';

import logger from 'helpers/logger';

import { eventTracking } from 'utils';
import { CheckboxName, CheckboxPurpose } from 'utils/Factory/EventCollection/constants/CheckboxEvent';
import modalEvent from 'utils/Factory/EventCollection/ModalEventCollection';

import { AWS_EVENTS } from 'constants/awsEvents';
import { LOGGER } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { STATIC_PAGE_URL } from 'constants/urls';

import styles from './FormFieldDetection.module.scss';

interface IFormFieldDetectionConsentProps {
  onDetectingFormField: () => Promise<void>;
  modalEventData: {
    modalName: string;
    modalPurpose: string;
  };
}

const FormFieldDetectionConsent = (props: IFormFieldDetectionConsentProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { onDetectingFormField, modalEventData } = props;

  const [isCheckedTermsAndConditions, setIsCheckedTermsAndConditions] = useState(false);
  const [isCheckedDocumentData, setIsCheckedDocumentData] = useState(false);

  const trackConsentAgreementEvent = (checkboxName: string, checkboxPurpose: string) => {
    eventTracking(AWS_EVENTS.FORM.CHECKBOX_UPDATED, {
      checkboxName,
      checkboxPurpose,
    }).catch((error: unknown) => logger.logError({ error, reason: LOGGER.Service.TRACK_EVENT_ERROR }));
  };

  const onCancelConsent = () => {
    dispatch(actions.closeModal() as AnyAction);
    modalEvent
      .modalDismiss(modalEventData)
      .catch((error: unknown) => logger.logError({ error, reason: LOGGER.Service.TRACK_EVENT_ERROR }));
  };

  const onAgreeConsent = async () => {
    dispatch(actions.closeModal() as AnyAction);
    modalEvent
      .modalConfirmation(modalEventData)
      .catch((error: unknown) => logger.logError({ error, reason: LOGGER.Service.TRACK_EVENT_ERROR }));

    if (isCheckedDocumentData) {
      trackConsentAgreementEvent(
        CheckboxName.AGREE_DOCUMENT_DATA_WILL_BE_USED,
        CheckboxPurpose[CheckboxName.AGREE_DOCUMENT_DATA_WILL_BE_USED]
      );
    }
    trackConsentAgreementEvent(CheckboxName.AGREE_TO_USE_SFD, CheckboxPurpose[CheckboxName.AGREE_TO_USE_SFD]);
    await onDetectingFormField();
  };

  return (
    <div className={styles.modalWrapper}>
      <h3 className={styles.title}>{t('viewer.formFieldDetection.consent.title')}</h3>

      <div className={styles.content}>
        <span className={styles.text}>{t('viewer.formFieldDetection.consent.desc')}</span>

        <div className={styles.noteWrapper}>
          <ul className={styles.noteList}>
            <li className={styles.text}>{t('viewer.formFieldDetection.consent.notes.model')}</li>
            <li className={styles.text}>
              <Trans
                i18nKey="viewer.formFieldDetection.consent.notes.documentData"
                components={{
                  Link: (
                    <Link target="_blank" className={styles.link} to={`${STATIC_PAGE_URL}${Routers.PRIVACY_POLICY}`} />
                  ),
                }}
              />
            </li>
          </ul>
        </div>

        <div className={styles.checkboxWrapper}>
          <span className={styles.text}>{t('viewer.formFieldDetection.consent.checkbox.header')}</span>
          <div className={styles.checkboxGroup}>
            <CheckboxV2
              className={styles.checkbox}
              checked={isCheckedTermsAndConditions}
              onChange={() => setIsCheckedTermsAndConditions(!isCheckedTermsAndConditions)}
            />
            <span
              className={styles.text}
              role="presentation"
              onClick={() => setIsCheckedTermsAndConditions(!isCheckedTermsAndConditions)}
            >
              <Trans
                i18nKey="viewer.formFieldDetection.consent.checkbox.termsAndConditions"
                components={{
                  Link: (
                    <Link
                      target="_blank"
                      className={styles.link}
                      to={`${STATIC_PAGE_URL}${Routers.TERMS_OF_USE}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ),
                }}
              />
            </span>
          </div>
          <div className={styles.checkboxGroup}>
            <CheckboxV2
              className={styles.checkbox}
              checked={isCheckedDocumentData}
              onChange={() => setIsCheckedDocumentData(!isCheckedDocumentData)}
            />
            <span
              className={styles.text}
              role="presentation"
              onClick={() => setIsCheckedDocumentData(!isCheckedDocumentData)}
            >
              {t('viewer.formFieldDetection.consent.checkbox.documentData')}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button size="lg" variant="outlined" onClick={onCancelConsent}>
          {t('common.cancel')}
        </Button>
        <Button disabled={!isCheckedTermsAndConditions} size="lg" variant="filled" onClick={onAgreeConsent}>
          {t('common.agree')}
        </Button>
      </div>
    </div>
  );
};

export default FormFieldDetectionConsent;
