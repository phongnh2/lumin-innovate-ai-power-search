import React from 'react';

import SignInRequiredProvider from '@new-ui/components/LuminRightSideBar/components/SignInRequiredProvider';

import EditInAgreementGenButton from 'features/AgreementGen/components/EditInAgreementGenButton';
import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolType } from 'features/QuickSearch/types';

export const AgreementGenTool: QuickSearchToolType[] = [
  {
    key: QUICK_SEARCH_TOOLS.AGREEMENT_GEN,
    title: 'AgreementGen',
    element: (
      <SignInRequiredProvider render={({ validate }) => <EditInAgreementGenButton toolValidateCallback={validate} />} />
    ),
  },
];
