import { TFunction } from 'react-i18next';

import { PRODUCTS } from 'features/CNC/constants/customConstant';
import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';

import { HELP_CENTER_URL } from 'constants/customConstant';

export const getCtaProps = (key: string, t: TFunction) => {
  switch (key) {
    case PRODUCTS.LUMIN_PDF:
      return {
        ctaTitle: t(`exploreOtherProducts.products.${key}.cta`),
        ctaName: CNCButtonName.START_FREE_TRIAL,
        helpUrl: `${HELP_CENTER_URL}/using-lumin?from=modal_explore_lumin_ecosystem`,
        helpBtnName: CNCButtonName.GET_HELP_LUMIN_PDF,
        helpBtnPurpose: CNCButtonPurpose[CNCButtonName.GET_HELP_LUMIN_PDF],
      };
    case PRODUCTS.LUMIN_SIGN:
      return {
        ctaTitle: t(`exploreOtherProducts.products.${key}.cta`),
        ctaName: CNCButtonName.TRY_LUMIN_SIGN_FREE,
        helpUrl: `${HELP_CENTER_URL}/using-lumin-sign?from=modal_explore_lumin_ecosystem`,
        helpBtnName: CNCButtonName.GET_HELP_LUMIN_SIGN,
        helpBtnPurpose: CNCButtonPurpose[CNCButtonName.GET_HELP_LUMIN_SIGN],
      };
    case PRODUCTS.AGREEMENT_GEN:
      return {
        ctaTitle: t(`exploreOtherProducts.products.${key}.cta`),
        ctaName: CNCButtonName.TRY_AGREEMENT_GEN_FREE,
        helpUrl: `${HELP_CENTER_URL}/using-agreementgen?from=modal_explore_lumin_ecosystem`,
        helpBtnName: CNCButtonName.GET_HELP_AGREEMENT_GEN,
        helpBtnPurpose: CNCButtonPurpose[CNCButtonName.GET_HELP_AGREEMENT_GEN],
      };
    case PRODUCTS.DOCUMENTS:
      return {
        ctaTitle: t(`exploreOtherProducts.products.${key}.cta`),
        ctaName: CNCButtonName.GET_STARTED,
        helpUrl: `${HELP_CENTER_URL}/workspaces-spaces#main-content?from=modal_explore_lumin_ecosystem`,
        helpBtnName: CNCButtonName.GET_HELP_LUMIN_PDF_WORKSPACE_AND_SPACE,
        helpBtnPurpose: CNCButtonPurpose[CNCButtonName.GET_HELP_LUMIN_PDF_WORKSPACE_AND_SPACE],
      };
    default:
      return {
        ctaTitle: '',
        ctaName: '',
        helpUrl: '',
        helpBtnName: '',
        helpBtnPurpose: '',
      };
  }
};
