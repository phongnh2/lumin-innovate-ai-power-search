/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { Link } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { Colors } from 'constants/styles';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { Plans } from 'constants/plan';
import { UrlSearchParam } from 'constants/UrlSearchParam';
import { useTranslation } from 'hooks';
import { PaymentCurrency } from 'constants/plan.enum';
import { getFooterTable } from './constants/footerPlans';

import * as Styled from './FooterRowTable.styled';

type PlanDataType = {
  key: string;
  buttonUrl: string;
  buttonColor: ButtonColor;
  buttonText: string;
};
const FooterRowTable = ({ plans }: { plans: { plan: string; color: string }[] }): JSX.Element => {
  const { t } = useTranslation();
  const { data: currentOrganization } = useSelector<unknown, { data: IOrganization }>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const { _id: orgId } = currentOrganization || {};
  const { value: locationCurrency } = useSelector<unknown, { value: PaymentCurrency, loading: boolean }>(
    selectors.getLocationCurrency,
    shallowEqual
  );
  const footerTable = getFooterTable({ locationCurrency });

  return (
    <Styled.Row>
      <span style={{ backgroundColor: Colors.WHITE }} />
      {plans.map(({ plan }) => {
        const planObjFind = (Object.values(footerTable.data) as unknown as [PlanDataType]).find(
          ({ key }) => key === plan
        );
        const { key, buttonUrl, buttonColor, buttonText } = planObjFind || {};

        const continueUrl =
          key !== Plans.FREE && orgId ? `${buttonUrl}?${UrlSearchParam.PAYMENT_ORG_TARGET}=${orgId}` : buttonUrl;

        const buttonCustomProp =
          key !== Plans.ENTERPRISE
            ? {
                component: Link,
                to: continueUrl,
              }
            : {
                component: 'a',
                href: buttonUrl,
                target: '_blank',
              };

        return (
          <Styled.ButtonWrapper key={key}>
            {/* @ts-ignore */}
            <Styled.Button size={ButtonSize.SM} color={buttonColor} {...buttonCustomProp}>
              {t(buttonText)}
            </Styled.Button>
          </Styled.ButtonWrapper>
        );
      })}
    </Styled.Row>
  );
};

export default FooterRowTable;
