import IconAnnotationActiveDark from 'assets/lumin-svgs/annotation-active-dark.svg?component';
import IconAnnotationActiveLight from 'assets/lumin-svgs/annotation-active-light.svg?component';
import IconAnnotationNormalDark from 'assets/lumin-svgs/annotation-normal-dark.svg?component';
import IconAnnotationNormalLight from 'assets/lumin-svgs/annotation-normal-light.svg?component';
import IconEditPdfActiveLight from 'assets/lumin-svgs/edit-pdf-active-light.svg?component';
import IconEditPdfNormalDark from 'assets/lumin-svgs/edit-pdf-normal-dark.svg?component';
import IconEditPdfNormalLight from 'assets/lumin-svgs/edit-pdf-normal-light.svg?component';
import IconFillAndSignActiveLight from 'assets/lumin-svgs/fill-and-sign-active-light.svg?component';
import IconFillAndSignNormalDark from 'assets/lumin-svgs/fill-and-sign-normal-dark.svg?component';
import IconFillAndSignNormalLight from 'assets/lumin-svgs/fill-and-sign-normal-light.svg?component';
import IconQuickSearch from 'assets/lumin-svgs/navigation-more-button.svg?component';
import IconPageToolsActiveLight from 'assets/lumin-svgs/page-tools-active-light.svg?component';
import IconPageToolsNormalDark from 'assets/lumin-svgs/page-tools-normal-dark.svg?component';
import IconPageToolsNormalLight from 'assets/lumin-svgs/page-tools-normal-light.svg?component';
import IconPopularActiveLight from 'assets/lumin-svgs/popular-active-light.svg?component';
import IconPopularNormalLight from 'assets/lumin-svgs/popular-normal-light.svg?component';
import IconSecurityActiveLight from 'assets/lumin-svgs/security-active-light.svg?component';
import IconSecurityNormalDark from 'assets/lumin-svgs/security-normal-dark.svg?component';
import IconSecurityNormalLight from 'assets/lumin-svgs/security-normal-light.svg?component';

import { DataElements } from 'constants/dataElement';
import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import { TOOLS_NAME } from 'constants/toolsName';

export const LEFT_SIDE_BAR = {
  POPULAR: 'POPULAR',
  ANNOTATION: 'ANNOTATION',
  FILL_AND_SIGN: 'FILL_AND_SIGN',
  EDIT_PDF: 'EDIT_PDF',
  SECURITY: 'SECURITY',
  PAGE_TOOLS: 'PAGE_TOOLS',
  QUICK_SEARCH: 'QUICK_SEARCH',
};

export const LEFT_SIDE_BAR_VALUES = {
  POPULAR: {
    value: LEFT_SIDE_BAR.POPULAR,
    label: 'viewer.leftSidebar.popular',
    icon: {
      normal: {
        light: IconPopularNormalLight,
        dark: IconPopularNormalLight,
      },
      active: {
        light: IconPopularActiveLight,
        dark: IconPopularActiveLight,
      },
    },
    dataElement: DataElements.POPULAR_TAB,
    allowInTempEditMode: true,
  },
  FILL_AND_SIGN: {
    value: LEFT_SIDE_BAR.FILL_AND_SIGN,
    // NOTE: later on use t
    label: 'viewer.leftSidebar.fillAndSign',
    icon: {
      normal: {
        light: IconFillAndSignNormalLight,
        dark: IconFillAndSignNormalDark,
      },
      active: {
        light: IconFillAndSignActiveLight,
        dark: IconFillAndSignActiveLight,
      },
    },
    dataElement: DataElements.FILL_AND_SIGN_TAB,
    allowInTempEditMode: false,
  },
  ANNOTATION: {
    value: LEFT_SIDE_BAR.ANNOTATION,
    // NOTE: later on use t
    label: 'viewer.leftSidebar.annotate',
    icon: {
      normal: {
        light: IconAnnotationNormalLight,
        dark: IconAnnotationNormalDark,
      },
      active: {
        light: IconAnnotationActiveLight,
        dark: IconAnnotationActiveDark,
      },
    },
    dataElement: DataElements.ANNOTATE_TAB,
    allowInTempEditMode: true,
  },
  EDIT_PDF: {
    value: LEFT_SIDE_BAR.EDIT_PDF,
    // NOTE: later on use t
    label: 'viewer.leftSidebar.editPDF',
    icon: {
      normal: {
        light: IconEditPdfNormalLight,
        dark: IconEditPdfNormalDark,
      },
      active: {
        light: IconEditPdfActiveLight,
        dark: IconEditPdfActiveLight,
      },
    },
    dataElement: DataElements.EDIT_PDF_TAB,
    toolName: TOOLS_NAME.CONTENT_EDIT,
    eventName: PremiumToolsPopOverEvent.EditPdf,
    validateMimeType: true,
    allowInTempEditMode: false,
  },
  SECURITY: {
    value: LEFT_SIDE_BAR.SECURITY,
    label: 'common.security',
    icon: {
      normal: {
        light: IconSecurityNormalLight,
        dark: IconSecurityNormalDark,
      },
      active: {
        light: IconSecurityActiveLight,
        dark: IconSecurityActiveLight,
      },
    },
    dataElement: DataElements.SECURITY_TAB,
    toolName: null,
    eventName: PremiumToolsPopOverEvent.Redaction,
    validateMimeType: true,
    allowInTempEditMode: false,
  },
  PAGE_TOOLS: {
    value: LEFT_SIDE_BAR.PAGE_TOOLS,
    // NOTE: later on use t
    label: 'viewer.leftSidebar.pageTools',
    icon: {
      normal: {
        light: IconPageToolsNormalLight,
        dark: IconPageToolsNormalDark,
      },
      active: {
        light: IconPageToolsActiveLight,
        dark: IconPageToolsActiveLight,
      },
    },
    dataElement: DataElements.PAGE_TOOLS_TAB,
    allowInTempEditMode: false,
  },
};

export const LEFT_SIDE_BAR_MENUS = {
  QUICK_SEARCH: {
    value: LEFT_SIDE_BAR.QUICK_SEARCH,
    label: 'viewer.quickSearch.navigationBar.label',
    icon: {
      normal: {
        light: IconQuickSearch,
        dark: IconQuickSearch,
      },
      active: {
        light: IconQuickSearch,
        dark: IconQuickSearch,
      },
    },
    allowInTempEditMode: false,
  },
};
