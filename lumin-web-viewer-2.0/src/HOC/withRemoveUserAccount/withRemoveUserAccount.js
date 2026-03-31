import { useSubscription } from '@apollo/client';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { DELETE_ACCOUNT_SUB } from 'graphQL/UserGraph';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { authServices } from 'services';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ModalTypes } from 'constants/lumin-common';
import { ModalPriority } from 'constants/styles/Modal';
import { STATIC_PAGE_URL } from 'constants/urls';

import './withRemoveUserAccount.scss';

const withRemoveUserAccount = (WrappedComponent) => {
  function HOC(props) {
    const { openModal } = props;

    const { t } = useTranslation();
    const handleConfirm = async () => {
      await authServices.afterSignOut({ returnTo: false });
    };

    const showDeletedAccountModal = () => {
      const modalData = {
        title: t('expiredPermissionModal.title'),
        message: (
          <h3>
            <span className="Container__Content--message">
              <Trans
                i18nKey="expiredPermissionModal.message"
                components={{
                  a: (
                    // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
                    <a
                      href={STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport'))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="Container__Content--link"
                    />
                  ),
                }}
              />
            </span>
          </h3>
        ),
        type: ModalTypes.WARNING,
        confirmButtonTitle: t('common.ok'),
        onConfirm: handleConfirm,
        className: 'withRemoveUserAccount__CustomModal',
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        priority: ModalPriority.HIGH,
        confirmButtonProps: {
          withExpandedSpace: true,
        },
        useReskinModal: true,
      };
      openModal(modalData);
    };

    const showDeleteAccountViaProvisioningModal = () => {
      const modalData = {
        type: ModalTypes.WARNING,
        title: t('scimProvision.deleteAccountViaProvisioningModal.title'),
        message: t('scimProvision.deleteAccountViaProvisioningModal.description'),
        useReskinModal: true,
        confirmButtonTitle: t('common.ok'),
        onConfirm: handleConfirm,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        priority: ModalPriority.HIGH,
      };
      openModal(modalData);
    };

    useSubscription(DELETE_ACCOUNT_SUB, {
      onData: ({
        data: {
          data: { deleteAccountSubscription },
        },
      }) => {
        const { fromProvisioning } = deleteAccountSubscription;
        if (fromProvisioning) {
          showDeleteAccountViaProvisioningModal();
          return;
        }
        showDeletedAccountModal();
      },
      skip: !props.currentUser,
    });

    return <WrappedComponent {...props} />;
  }

  HOC.propTypes = {
    currentUser: PropTypes.object,
    openModal: PropTypes.func,
  };

  HOC.defaultProps = {
    openModal: () => {},
    currentUser: null,
  };

  const mapStateToProps = (state) => ({
    currentUser: selectors.getCurrentUser(state),
  });

  const mapDispatchToProps = (dispatch) => ({
    openModal: (modalSetting) => dispatch(actions.openModal(modalSetting)),
  });

  return compose(connect(mapStateToProps, mapDispatchToProps))(HOC);
};

export default withRemoveUserAccount;
