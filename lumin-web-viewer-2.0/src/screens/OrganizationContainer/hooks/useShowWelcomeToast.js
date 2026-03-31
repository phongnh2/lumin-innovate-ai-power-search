import React, { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useSelector, shallowEqual } from 'react-redux';
import { useLocation } from 'react-router-dom';

import selectors from 'selectors';

import { toastUtils } from 'utils';

import { ModalTypes } from 'constants/lumin-common';
import { ORG_ACTION } from 'constants/organizationConstants';

export const useShowWelcomeToast = () => {
  const { state } = useLocation();

  const { loading, data } = useSelector(selectors.getCurrentOrganization, shallowEqual);

  const { name: orgName } = data || {};
  const { action } = state || {};

  const willShowWelcome = action === ORG_ACTION.WELCOME;

  useEffect(() => {
    if (willShowWelcome && !loading) {
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        disableAnimationInEffect: true,
        message: (
          <Trans
            i18nKey="createOrg.welcomeToOrg"
            values={{ name: orgName }}
            components={{ b: <b style={{ fontWeight: 700 }} /> }}
          />
        ),
      });
    }
  }, [loading, orgName, willShowWelcome]);
};
