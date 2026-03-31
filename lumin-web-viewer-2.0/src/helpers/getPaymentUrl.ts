import { get } from "lodash";

import { PaymentUrlSerializer } from "utils/payment";

import { PERIOD, Plans } from "constants/plan";

import { IDocumentBase } from "interfaces/document/document.interface";
import { IOrganizationPayment } from "interfaces/payment/payment.interface";

const getTrialInfo = (currentDocument: IDocumentBase) => {
  const data: IOrganizationPayment["trialInfo"] = get(currentDocument, 'documentReference.data.payment.trialInfo');

  if (data) {
    if (data.canUseProTrial) {
      return Plans.ORG_PRO;
    }
    if (data.canUseBusinessTrial) {
      return Plans.ORG_BUSINESS;
    }
    return Plans.ORG_PRO;
  }

};

export const getPaymentUrl = ({
  currentDocument,
  orgId,
  isStartTrial,
}: {
  currentDocument: IDocumentBase;
  orgId: string;
  isStartTrial?: boolean;
}) => {
  const paymentUrlSerializer = new PaymentUrlSerializer();
  const trialInfo = getTrialInfo(currentDocument);
  if (trialInfo) {
    return paymentUrlSerializer.of(orgId).plan(trialInfo).trial(isStartTrial).period(PERIOD.ANNUAL).returnUrlParam().get();
  }
};
