import { PRODUCTS } from 'features/CNC/constants/customConstant';

import styles from '../ExploreOtherProductsModal.module.scss';

const logoActiveStateClassnames = {
  [PRODUCTS.LUMIN_PDF]: styles.activeLuminPdfLogo,
  [PRODUCTS.LUMIN_SIGN]: styles.activeLuminSignLogo,
  [PRODUCTS.AGREEMENT_GEN]: styles.activeAgreementGenLogo,
  [PRODUCTS.DOCUMENTS]: styles.activeDocumentLogo,
} as const;

export const getLogoActiveStateClassname = (key: string): string =>
  logoActiveStateClassnames[key as keyof typeof logoActiveStateClassnames] || styles.activeLuminPdfLogo;
