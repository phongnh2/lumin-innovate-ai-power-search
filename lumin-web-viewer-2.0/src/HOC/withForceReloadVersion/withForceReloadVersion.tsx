import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { AnyAction, compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { AppDispatch, RootState } from 'store';

import { useTranslation } from 'hooks';

import { ModalTypes } from 'constants/lumin-common';
import { ModalPriority } from 'constants/styles/Modal';

const withForceReloadVersion = (Component: React.ComponentType<any>) => {
  function HOC(props: {
    forceReloadVersion: boolean;
    openModal: (modalSetting: Record<string, unknown>) => void;
  }): React.ReactElement {
    const { forceReloadVersion, openModal } = props;
    const { t } = useTranslation();
    const showForceReloadVersion = () => {
      const modalData = {
        title: t('forceReloadVersionModal.title'),
        message: t('forceReloadVersionModal.message'),
        type: ModalTypes.WARNING,
        isFullWidthButton: true,
        confirmButtonTitle: t('common.ok'),
        onConfirm: () => window.location.reload(),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        priority: ModalPriority.HIGH,
      };
      openModal(modalData);
    };
    useEffect(() => {
      if (forceReloadVersion) {
        showForceReloadVersion();
      }
    }, [forceReloadVersion]);
    return <Component {...props} />;
  }
  const mapStateToProps = (state: RootState) => ({
    forceReloadVersion: selectors.getForceReloadVersion(state),
  });

  const mapDispatchToProps = (dispatch: AppDispatch) => ({
    openModal: (modalSetting: Record<string, unknown>) => dispatch(actions.openModal(modalSetting) as AnyAction),
  });
  return compose(connect(mapStateToProps, mapDispatchToProps))(HOC);
};

export default withForceReloadVersion;
