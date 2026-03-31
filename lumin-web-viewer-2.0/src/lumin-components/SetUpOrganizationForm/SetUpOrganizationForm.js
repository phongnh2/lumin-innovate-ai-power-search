import { TextInput, Switch as KiwiSwitch, Chip, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Input from 'lumin-components/Shared/Input';
import Switch from 'lumin-components/Shared/Switch';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { getErrorMessageTranslated } from 'utils';
import common from 'utils/common';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ModalTypes } from 'constants/lumin-common';
import { ORG_SET_UP_TYPE } from 'constants/organizationConstants';
import { NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';

import useHandleSubmit from './hook/useHandleSubmit';

import * as Styled from './SetUpOrganizationForm.styled';

import styles from './SetUpOrganizationForm.module.scss';

const PURPOSE_LIST = Object.values(ORG_SET_UP_TYPE);

const SetUpOrganizationForm = ({
  title,
  setCurrentStep,
  setCreateOrgData,
  purpose,
  setPurpose,
  control,
  handleSubmit,
  formState,
  setIsDisableBackButton,
  setValue,
  isReskin,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const { email, isPopularDomain } = useSelector(selectors.getCurrentUser, shallowEqual);
  const suggestedOrganizations = useSelector(selectors.getSuggestedOrganizations, shallowEqual).data || [];
  const [isLoading, setIsLoading] = useState(false);
  const url = common.getDomainFromEmail(email);
  const hasLinkJoinOrg = Boolean(suggestedOrganizations.length);
  const { isValid, isSubmitting, errors } = formState;

  const { onSubmit } = useHandleSubmit({
    setCurrentStep,
    setCreateOrgData,
    purpose,
    setIsLoading,
    setIsDisableBackButton,
  });
  const { onKeyDown } = useKeyboardAccessibility();

  const submit = async ({ orgName, visibility }) => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    await onSubmit({ orgName, visibility });
  };

  const beforeSubmit = async ({ orgName, visibility }) => {
    if (!isPopularDomain && !visibility) {
      const modalSettings = {
        type: isReskin ? '' : ModalTypes.INFO,
        title: t('setUpOrg.loneOrg'),
        message: (
          <Trans
            i18nKey="setUpOrg.messageLoneOrg"
            values={{ domain: url }}
            components={{ b: <b className={isReskin && styles.boldText} /> }}
          />
        ),
        cancelButtonTitle: t('common.skip'),
        confirmButtonTitle: t('common.enable'),
        onCancel: () => submit({ orgName, visibility }),
        onConfirm: () => setValue('visibility', true),
        useReskinModal: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      };
      dispatch(actions.openModal(modalSettings));
    } else {
      await onSubmit({ orgName, visibility });
    }
  };

  if (isReskin) {
    return (
      <div className={styles.container}>
        <p className={styles.title}>{title}</p>
        <div className={styles.inputWrapper}>
          <p className={styles.label}>{t('setUpOrg.inputOrgName')}</p>
          <Controller
            control={control}
            name="orgName"
            render={({ field: { ...rest } }) => (
              <TextInput
                clearable
                autoFocus
                size="lg"
                placeholder={t('common.eg', { egText: 'luminpdf' })}
                error={getErrorMessageTranslated(errors?.orgName?.message)}
                disabled={isSubmitting}
                {...rest}
              />
            )}
          />
        </div>
        {!isPopularDomain && (
          <div className={styles.switchWrapper}>
            <Controller
              control={control}
              name="visibility"
              render={({ field: { value, ...rest } }) => (
                <KiwiSwitch
                  classNames={{
                    label: styles.switchLabel,
                  }}
                  label={
                    <Trans
                      i18nKey="setUpOrg.anyoneWithUrlDomainCanJoin"
                      components={{
                        b: <b style={{ fontWeight: 700 }} />,
                      }}
                      values={{
                        url,
                      }}
                    />
                  }
                  checked={value}
                  {...rest}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
        )}
        <div className={styles.chipWrapper}>
          <p className={styles.label}>{t('setUpOrg.planningToUse')}</p>
          <div className={styles.chips}>
            {PURPOSE_LIST.map((item) => (
              <Chip
                role="button"
                tabIndex={0}
                key={item}
                enablePointerEvents
                size="md"
                colorType={item === purpose ? 'blue' : 'grey'}
                label={t(`setUpOrg.${item.toLowerCase()}`)}
                disabled={isSubmitting}
                onClick={() => !isSubmitting && setPurpose(item)}
                onKeyDown={onKeyDown}
                data-lumin-btn-name={ButtonName.ONBOARDING_CIRCLE_PURPOSE}
              />
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          {hasLinkJoinOrg && (
            <Button
              size="lg"
              variant="outlined"
              disabled={isSubmitting || isLoading}
              onClick={() => navigate(`${NEW_AUTH_FLOW_ROUTE.JOIN_YOUR_ORGANIZATION}${search}`)}
              data-lumin-btn-name={ButtonName.ON_BOARDING_JOIN_AN_ORGANIZATION_INSTEAD}
              data-lumin-btn-purpose={ButtonPurpose[ButtonName.ON_BOARDING_JOIN_AN_ORGANIZATION_INSTEAD]}
            >
              {t('setUpOrg.joinOrgInstead')}
            </Button>
          )}
          <Button
            size="lg"
            variant="filled"
            onClick={handleSubmit(beforeSubmit)}
            disabled={!isValid || !purpose || isSubmitting}
            loading={isSubmitting || isLoading}
            data-lumin-btn-name={ButtonName.ONBOARDING_CREATE_NEW_CIRCLE_CONTINUE}
          >
            {t('setUpOrg.next')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Styled.Container>
      <Styled.Title>{title}</Styled.Title>
      <Styled.InputWrapper>
        <Controller
          control={control}
          name="orgName"
          render={({ field: { ...rest } }) => (
            <Input
              label={t('setUpOrg.inputOrgName')}
              placeholder={t('common.eg', { egText: 'luminpdf' })}
              errorMessage={getErrorMessageTranslated(errors?.orgName?.message)}
              showClearButton
              disabled={isSubmitting}
              autoFocus
              {...rest}
            />
          )}
        />
      </Styled.InputWrapper>
      {!isPopularDomain && (
        <Styled.SwitchWrapper>
          <Controller
            control={control}
            name="visibility"
            render={({ field: { value, ...rest } }) => <Switch checked={value} {...rest} disabled={isSubmitting} />}
          />
          <Styled.TextSwitch>
            <Trans i18nKey="setUpOrg.anyoneWithUrlDomainCanJoin" components={{ b: <b /> }} values={{ url }} />
          </Styled.TextSwitch>
        </Styled.SwitchWrapper>
      )}
      <Styled.TypeWrapper>
        <Styled.TypeLabel>{t('setUpOrg.purposeUseLumin')}</Styled.TypeLabel>
        <Styled.TypeContainer>
          <Styled.TypeGroup>
            {PURPOSE_LIST.map((item) => {
              const active = item === purpose;

              return (
                <Styled.TypeItem
                  key={item}
                  onClick={() => !isSubmitting && setPurpose(item)}
                  $active={active}
                  $disabled={isSubmitting}
                  data-lumin-btn-name={ButtonName.ONBOARDING_CIRCLE_PURPOSE}
                >
                  {t(`setUpOrg.${item.toLowerCase()}`)}
                </Styled.TypeItem>
              );
            })}
          </Styled.TypeGroup>
        </Styled.TypeContainer>
      </Styled.TypeWrapper>

      <Styled.ButtonWrapper>
        <Styled.Button
          size={ButtonSize.XL}
          onClick={handleSubmit(beforeSubmit)}
          disabled={!isValid || !purpose || isSubmitting}
          $hasLinkJoinOrg={hasLinkJoinOrg}
          loading={isSubmitting || isLoading}
          data-lumin-btn-name={ButtonName.ONBOARDING_CREATE_NEW_CIRCLE_CONTINUE}
        >
          {t('setUpOrg.next')}
        </Styled.Button>
        {hasLinkJoinOrg && (
          <Styled.Link
            to={`${NEW_AUTH_FLOW_ROUTE.JOIN_YOUR_ORGANIZATION}${search}`}
            data-lumin-btn-name={ButtonName.ON_BOARDING_JOIN_AN_ORGANIZATION_INSTEAD}
            data-lumin-btn-purpose={ButtonPurpose[ButtonName.ON_BOARDING_JOIN_AN_ORGANIZATION_INSTEAD]}
            $loading={isSubmitting || isLoading}
          >
            {t('setUpOrg.joinOrgInstead')}
          </Styled.Link>
        )}
      </Styled.ButtonWrapper>
    </Styled.Container>
  );
};

SetUpOrganizationForm.propTypes = {
  title: PropTypes.string.isRequired,
  hasLinkJoinOrg: PropTypes.bool,
  hasMainOrg: PropTypes.bool,
  setCurrentStep: PropTypes.func.isRequired,
  setCreateOrgData: PropTypes.func.isRequired,
  purpose: PropTypes.string.isRequired,
  setPurpose: PropTypes.func.isRequired,
  control: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  formState: PropTypes.object.isRequired,
  setIsDisableBackButton: PropTypes.func,
  setValue: PropTypes.func,
  isReskin: PropTypes.bool,
};

SetUpOrganizationForm.defaultProps = {
  hasLinkJoinOrg: false,
  hasMainOrg: false,
  setIsDisableBackButton: () => {},
  setValue: () => {},
  isReskin: false,
};

export default SetUpOrganizationForm;
