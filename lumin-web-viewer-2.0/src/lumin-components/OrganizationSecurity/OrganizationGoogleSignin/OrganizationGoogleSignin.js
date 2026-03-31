import produce from 'immer';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useEnableWebReskin, useGapiLoaded, useTranslation } from 'hooks';

import { organizationServices, userServices } from 'services';
import { kratosService } from 'services/oryServices';
import { ProfileSettingSections } from 'services/oryServices/kratos';

import { toastUtils } from 'utils';

import { HELP_CENTER_URL } from 'constants/customConstant';
import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_CREATION_TYPE } from 'constants/organizationConstants';

import QuestionPanel from '../../QuestionPanel';
import { useGetPermission } from '../VisibilitySettings/hooks/useGetPermission';

import * as Styled from './OrganizationGoogleSignin.styled';

import styles from './OrganizationGoogleSignin.module.scss';

const propTypes = {
  currentOrganization: PropTypes.object.isRequired,
  openModal: PropTypes.func,
  closeModal: PropTypes.func,
  updateModalProperties: PropTypes.func,
  currentUser: PropTypes.object,
};
const defaultProps = {
  openModal: () => {},
  closeModal: () => {},
  updateModalProperties: () => {},
  currentUser: {},
};

const OrganizationGoogleSignin = ({
  currentUser,
  currentOrganization,
  openModal,
  closeModal,
  updateModalProperties,
}) => {
  const { settings, _id: orgId, domain, name, associateDomains, creationType } = currentOrganization;
  const isMainOrganization = creationType === ORGANIZATION_CREATION_TYPE.AUTOMATIC;
  const { t } = useTranslation();
  const { canModifySecurity } = useGetPermission();
  const { isEnableReskin } = useEnableWebReskin();

  const MessagePrimary = isEnableReskin ? <span className="kiwi-message--primary" /> : <Styled.MessagePrimary />;

  const getListDomain = () => {
    const listDomain = isMainOrganization ? [domain, ...associateDomains] : associateDomains;

    return listDomain.map((item) => `name@${item}`).join(', ');
  };

  const gapiLoaded = useGapiLoaded();
  const [loading, setLoading] = useState(true);
  const [googleSignInData, updateGoogleSigninData] = useState({
    title: t('orgDashboardSecurity.authentication'),
    options: [
      {
        title: t('orgDashboardSecurity.signInWithGoogle'),
        subtitle: (
          <Trans
            i18nKey="orgDashboardSecurity.requireMemberSignInGoogle"
            components={{
              Link: isEnableReskin ? (
                // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                <a
                  className={styles.learnMore}
                  href={`${HELP_CENTER_URL}/how-do-i-set-up-google-sign-in`}
                  target="_blank"
                  rel="noreferrer"
                />
              ) : (
                <Styled.LearnMore href={`${HELP_CENTER_URL}/how-do-i-set-up-google-sign-in`} target="_blank" />
              ),
            }}
          />
        ),
        question: {
          type: 'SWITCH',
          field: {
            key: 'googleSignIn',
            value: settings.googleSignIn,
          },
          dependents: [],
        },
      },
    ],
    permission: {
      isAllow: true,
      disallowedReason: t('orgDashboardSecurity.disallowDifferentDomain'),
      requiredUpgrade: false,
    },
  });

  const redirectToProfileSetting = async () => {
    updateModalProperties({
      isProcessing: true,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
    });
    kratosService.profileSettings(true, ProfileSettingSections.GOOGLE_SIGN_IN);
  };

  const updateGoogleSignIn = async (value) => {
    try {
      updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      });
      await organizationServices.updateGoogleSignInSecurity(orgId, value);
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: (
          <Trans i18nKey="orgDashboardSecurity.googleSignInHasBeenUpdated">
            <span className="Toast__message--primary">Google Sign-in</span> setting has been updated
          </Trans>
        ),
      });
      const updatedData = produce(googleSignInData, (draft) => {
        draft.options[0].question.field.value = value;
      });
      updateGoogleSigninData(updatedData);
    } finally {
      closeModal();
    }
  };

  const updateGoogleSignInHOC = async (fieldChanged) => {
    const isManagerSigninWithGoogle = await userServices.isUserLoginWithGoogle({
      loginService: currentUser.loginService,
    });
    if (isManagerSigninWithGoogle) {
      const { value } = fieldChanged;
      const modalSettings = {
        type: ModalTypes.WARNING,
        cancelButtonTitle: t('common.cancel'),
        closeOnConfirm: false,
        onConfirm: () => updateGoogleSignIn(value),
        onCancel: () => {},
        useReskinModal: true,
      };
      if (value) {
        openModal({
          ...modalSettings,
          title: t('orgDashboardSecurity.modalGoogleSignIn.enableGoogleSignIn.title'),
          message: (
            <Trans
              i18nKey="orgDashboardSecurity.modalGoogleSignIn.enableGoogleSignIn.message"
              values={{ list: getListDomain() }}
              components={{ b: MessagePrimary }}
            />
          ),
          confirmButtonTitle: t('common.enable'),
        });
      } else {
        openModal({
          ...modalSettings,
          title: t('orgDashboardSecurity.modalGoogleSignIn.disableGoogleSignIn.title'),
          message: (
            <Trans
              i18nKey="orgDashboardSecurity.modalGoogleSignIn.disableGoogleSignIn.message"
              values={{ list: getListDomain() }}
              components={{ b: MessagePrimary }}
            />
          ),
          confirmButtonTitle: t('common.disable'),
        });
      }
    } else {
      openModal({
        title: t('orgDashboardSecurity.modalGoogleSignIn.changeLoginMethod.title'),
        message: (
          <Trans
            i18nKey="orgDashboardSecurity.modalGoogleSignIn.changeLoginMethod.message"
            values={{ name }}
            components={{ b: MessagePrimary }}
          />
        ),
        type: ModalTypes.WARNING,
        confirmButtonTitle: t('common.continue'),
        cancelButtonTitle: t('common.cancel'),
        closeOnConfirm: false,
        onConfirm: () => redirectToProfileSetting(),
        onCancel: () => {},
        useReskinModal: true,
      });
    }
  };

  useEffect(() => {
    const updatePermissionData = (draft) => {
      draft.permission.isAllow = false;
      draft.options[0].question.field.value = false;
      draft.options[0].question.disabled = true;
    };

    try {
      setLoading(true);
      let updatedData = googleSignInData;
      if (!settings.googleSignIn && !canModifySecurity) {
        updatedData = produce(updatedData, (draft) => {
          updatePermissionData(draft);
          draft.permission.requiredUpgrade = true;
          draft.permission.disallowedReason = '';
        });
      }

      if (
        !userServices.isInternalOrgUser(currentUser.email, domain) &&
        !userServices.isUserWithAssociateDomain(currentUser.email, associateDomains)
      ) {
        // user is not in the same domain or associate domain;
        updatedData = produce(updatedData, (draft) => {
          updatePermissionData(draft);
        });
      }
      if (!isMainOrganization && !associateDomains.length) {
        // organization without associated domain;
        updatedData = produce(updatedData, (draft) => {
          draft.permission.disallowedReason = t('orgDashboardSecurity.disallowForOrgHasNotAssociatedDomain');
          updatePermissionData(draft);
        });
      }
      if (userServices.isUserLoginWithDropbox({ loginService: currentUser.loginService })) {
        // user is login with dropbox;
        updatedData = produce(updatedData, (draft) => {
          draft.permission.disallowedReason = t('orgDashboardSecurity.disallowForDropbox');
          updatePermissionData(draft);
        });
      }
      updateGoogleSigninData(updatedData);
    } finally {
      setLoading(false);
    }
  }, [associateDomains, currentOrganization.payment.type, currentUser.loginService, domain, settings.googleSignIn]);

  if (!gapiLoaded) {
    return null;
  }

  return <QuestionPanel section={googleSignInData} updateData={updateGoogleSignInHOC} loading={loading} />;
};

OrganizationGoogleSignin.propTypes = propTypes;
OrganizationGoogleSignin.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state).data,
  currentUser: selectors.getCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (settings) => dispatch(actions.openModal(settings)),
  updateModalProperties: (data) => dispatch(actions.updateModalProperties(data)),
  closeModal: () => dispatch(actions.closeModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationGoogleSignin);
