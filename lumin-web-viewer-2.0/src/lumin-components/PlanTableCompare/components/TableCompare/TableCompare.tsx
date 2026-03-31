import React from 'react';

import { useTranslation } from 'hooks';

import { PRICING_FEATURES, CATEGORY_FEATURE, ALL_PLAN_FEATURES, PLAN_CONFIG } from 'constants/detailPlanConstants';
import { ORG_PLAN_TYPE } from 'constants/plan';

import CategoryRow from '../CategoryRow';
import DetailPlanRow from '../DetailPlanRow';
import FooterRowTable from '../FooterRowTable';
import HeaderRowTable from '../HeaderRowTable/HeaderRowTable';

import * as Styled from './TableCompare.styled';

const TableCompare = ({ showPlanTable }: { showPlanTable: boolean }): JSX.Element => {
  const { t } = useTranslation();

  const renderCategory = (category: string): JSX.Element => (
    <React.Fragment key={category}>
      {category !== CATEGORY_FEATURE.DEFAULT && <CategoryRow title={t(category)} />}
      {Object.values(PRICING_FEATURES[category]).map((feature) => (
        <DetailPlanRow
          key={feature.title}
          plans={Object.values(ORG_PLAN_TYPE)}
          feature={feature}
          featureDetails={Object.values(ALL_PLAN_FEATURES).map((plan) => plan[feature.title])}
        />
      ))}
    </React.Fragment>
  );
  const renderTable = (): JSX.Element => (
    <>
      <HeaderRowTable plans={PLAN_CONFIG} showPlanTable={showPlanTable} />
      {Object.values(CATEGORY_FEATURE).map((category) => renderCategory(category))}
      <FooterRowTable plans={PLAN_CONFIG} />
    </>
  );

  return (
    <Styled.Container>
      <Styled.Table>{renderTable()}</Styled.Table>
    </Styled.Container>
  );
};

export default TableCompare;
