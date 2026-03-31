/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { getPlanBoxList } from 'constants/detailPlanConstants';
import { Plans } from 'constants/plan';
import { PaymentCurrency } from 'constants/plan.enum';

const COMMON_PROPERTY_PLAN = {
  buttonText: 'plan.tryFree',
};

export const getFooterTable = ({
  locationCurrency,
}: {
  locationCurrency: PaymentCurrency;
}): {
  data: Record<string, unknown>;
} => {
  const planBoxList = getPlanBoxList({ currency: locationCurrency });

  return ({
    data: {
      [Plans.FREE]: {
        ...(planBoxList.data[Plans.FREE] as Record<string, unknown>),
        buttonText: 'common.getStarted',
        buttonColor: ButtonColor.SECONDARY_BLACK,
      },
      [Plans.ORG_STARTER]: {
        ...COMMON_PROPERTY_PLAN,
        ...(planBoxList.data[Plans.ORG_STARTER] as Record<string, unknown>),
        buttonColor: ButtonColor.SECONDARY_BLACK,
      },
      [Plans.ORG_PRO]: {
        ...COMMON_PROPERTY_PLAN,
        ...(planBoxList.data[Plans.ORG_PRO] as Record<string, unknown>),
        buttonColor: ButtonColor.PRIMARY_GREEN,
      },
      [Plans.ORG_BUSINESS]: {
        ...COMMON_PROPERTY_PLAN,
        ...(planBoxList.data[Plans.ORG_BUSINESS] as Record<string, unknown>),
        buttonColor: ButtonColor.SECONDARY_BLACK,
      },
      [Plans.ENTERPRISE]: {
        ...(planBoxList.data[Plans.ENTERPRISE] as Record<string, unknown>),
        buttonColor: ButtonColor.SECONDARY_BLACK,
      },
    },
  });
};
