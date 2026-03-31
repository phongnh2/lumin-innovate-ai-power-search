import { AGREEMENT_GEN_APP_URL } from 'constants/urls';

type AgreementGenAction = 'navigation-generate' | 'home-write-agreement' | 'top-banner-discover';

type AgreementGenFrom = 'pdf-doclist' | 'pdf-editor';

export const getAgreementGenUrl = (action: AgreementGenAction, from: AgreementGenFrom = 'pdf-doclist') =>
  `${AGREEMENT_GEN_APP_URL}/documents?from=${from}&action=${action}`;
