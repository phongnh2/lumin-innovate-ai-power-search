/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';

import Collapse from 'luminComponents/Shared/Collapse';

import { useTranslation } from 'hooks';

import TableCompare from './components/TableCompare';

import * as Styled from './PlanTableCompare.styled';

const PlanTableCompare = (): JSX.Element => {
  const [show, setShow] = useState(true);
  const { t } = useTranslation();

  return (
    <>
      <Styled.ButtonContainer>
        <Styled.ShowAllButton onClick={() => setShow(!show)}>
          <Styled.ButtonText>
            {show ? t('plan.hideDetailedPlanComparison') : t('plan.showDetailedPlanComparison')}
          </Styled.ButtonText>
          {/* @ts-ignore */}
          <Styled.ShowAllIcon className="icon-arrow-down-alt" $show={show} size={12} />
        </Styled.ShowAllButton>
      </Styled.ButtonContainer>
      <Collapse isExpand={show} timeout={500}>
        <Styled.PlanDetailCompareContainer $show={show}>
          <TableCompare showPlanTable={show} />
        </Styled.PlanDetailCompareContainer>
      </Collapse>
    </>
  );
};

export default PlanTableCompare;
