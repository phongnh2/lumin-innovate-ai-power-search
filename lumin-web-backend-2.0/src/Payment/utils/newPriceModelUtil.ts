import { DEFAULT_ACTION_COUNT_DOC_STACK, newPriceModelVariant } from 'Payment/Policy/newPriceModel';

export function getDocStackForNewPriceModel(variant: string, isBusinessDomain: boolean) {
  const emailType = isBusinessDomain ? 'businessEmail' : 'nonBusinessEmail';
  return (
    newPriceModelVariant[variant]?.[emailType]?.docStack
    ?? newPriceModelVariant.VariantA[emailType].docStack
  );
}

export function getActionSyncForNewPriceModel(variant: string): {
    print: boolean;
    download: boolean;
    share: boolean;
    sync: boolean;
} {
  return newPriceModelVariant[variant]?.actionCountDocStack || DEFAULT_ACTION_COUNT_DOC_STACK;
}
