import React from 'react';
import { Trans } from 'react-i18next';

import { ModalTypes } from 'constants/lumin-common';
import { PLAN_TYPE_LABEL } from 'constants/plan';

export const getModalUpgradingSettings = ({ t, metadata }) => ({
  type: ModalTypes.WARNING,
  title: t('common.warning'),
  message: <Trans i18nKey="modalChangingPlan.message" values={{ plan: PLAN_TYPE_LABEL[metadata.plan] }} />,
  confirmButtonTitle: t('common.ok'),
});
