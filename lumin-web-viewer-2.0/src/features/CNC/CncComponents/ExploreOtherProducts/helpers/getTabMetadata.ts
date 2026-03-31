import { PRODUCTS } from 'features/CNC/constants/customConstant';
import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';

import styles from '../ExploreOtherProductsModal.module.scss';

interface TabInfo {
  tabName: string;
  tabPurpose?: string;
}

const tabActiveStateClassnames = {
  [PRODUCTS.LUMIN_PDF]: styles.activeLuminPdfTab,
  [PRODUCTS.LUMIN_SIGN]: styles.activeLuminSignTab,
  [PRODUCTS.AGREEMENT_GEN]: styles.activeAgreementGenTab,
  [PRODUCTS.DOCUMENTS]: styles.activeDocumentTab,
} as const;

const getTabActiveStateClassname = (key: string): string =>
  tabActiveStateClassnames[key as keyof typeof tabActiveStateClassnames] || styles.activeLuminPdfTab;

const getProductTabInfo = (key: string): TabInfo => {
  const defaultInfo: TabInfo = {
    tabName: CNCButtonName.LUMIN_PDF,
    tabPurpose: CNCButtonPurpose.LUMIN_PDF,
  };

  const productTabInfoMap: Record<string, TabInfo> = {
    [PRODUCTS.LUMIN_PDF]: {
      tabName: CNCButtonName.LUMIN_PDF,
      tabPurpose: CNCButtonPurpose[CNCButtonName.LUMIN_PDF],
    },
    [PRODUCTS.LUMIN_SIGN]: {
      tabName: CNCButtonName.LUMIN_SIGN,
      tabPurpose: CNCButtonPurpose[CNCButtonName.LUMIN_SIGN],
    },
    [PRODUCTS.AGREEMENT_GEN]: {
      tabName: CNCButtonName.AGREEMENT_GEN,
      tabPurpose: CNCButtonPurpose[CNCButtonName.AGREEMENT_GEN],
    },
    [PRODUCTS.DOCUMENTS]: {
      tabName: CNCButtonName.DOCUMENTS,
      tabPurpose: CNCButtonPurpose[CNCButtonName.DOCUMENTS],
    },
  };

  return productTabInfoMap[key] || defaultInfo;
};

export { getTabActiveStateClassname, getProductTabInfo };
