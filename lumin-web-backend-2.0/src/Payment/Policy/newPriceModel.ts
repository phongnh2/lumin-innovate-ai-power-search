const VARIANT_A = 'VariantA';
const VARIANT_B = 'VariantB';
const VARIANT_C = 'VariantC';
const VARIANT_D = 'VariantD';
const VARIANT_E = 'VariantE';

export const newPriceModelVariant = {
  [VARIANT_A]: {
    businessEmail: {
      docStack: 3,
    },
    nonBusinessEmail: {
      docStack: 3,
    },
    actionCountDocStack: {
      print: true,
      download: true,
      share: true,
      sync: false,
    },
  },
  [VARIANT_B]: {
    businessEmail: {
      docStack: 3,
    },
    nonBusinessEmail: {
      docStack: 1000,
    },
    actionCountDocStack: {
      print: true,
      download: true,
      share: true,
      sync: false,
    },
  },
  [VARIANT_C]: {
    businessEmail: {
      docStack: 3,
    },
    nonBusinessEmail: {
      docStack: 1000,
    },
    actionCountDocStack: {
      print: true,
      download: true,
      share: true,
      sync: true,
    },
  },
  [VARIANT_D]: {
    businessEmail: {
      docStack: 1000,
    },
    nonBusinessEmail: {
      docStack: 1000,
    },
    actionCountDocStack: {
      print: true,
      download: true,
      share: true,
      sync: true,
    },
  },
  [VARIANT_E]: {
    businessEmail: {
      docStack: 3,
    },
    nonBusinessEmail: {
      docStack: 1000,
    },
    actionCountDocStack: {
      print: true,
      download: true,
      share: true,
      sync: true,
    },
  },
};

export const DEFAULT_ACTION_COUNT_DOC_STACK = {
  print: true,
  download: true,
  share: true,
  sync: false,
};

export const TEMPLATE_ACTION_COUNT_DOC_STACK = {
  print: false,
  download: false,
  share: false,
  sync: false,
};
