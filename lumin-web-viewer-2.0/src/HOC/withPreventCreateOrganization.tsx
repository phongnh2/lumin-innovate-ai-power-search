import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { openModal } from 'actions/customActions';

import { useTranslation } from 'hooks';

import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes } from 'constants/lumin-common';

const withPreventCreateOrganization =
  <T,>(WrappedComponent: React.ComponentType<T>) =>
  (props: T) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const modalSetting = useMemo(
      () => ({
        type: ModalTypes.WARNING,
        title: t('outdatedStateModal.title'),
        message: t('outdatedStateModal.message'),
        confirmButtonTitle: t('common.reload'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        onConfirm: () => window.location.reload(),
        useReskinModal: true,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    useEffect(() => {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === LocalStorageKey.HAS_CREATED_ORGANIZATION_ON_PAYMENT_PAGE && event.newValue === 'true') {
          dispatch(openModal(modalSetting));
          localStorage.removeItem(LocalStorageKey.HAS_CREATED_ORGANIZATION_ON_PAYMENT_PAGE);
        }
      };

      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, [dispatch]);

    return <WrappedComponent {...props} />;
  };

export default withPreventCreateOrganization;
