/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';

import { useTranslation } from 'hooks';
import Tooltip from 'luminComponents/Shared/Tooltip';
import PlanCell from '../PlanCell';

import * as Styled from './DetailPlanRow.styled';

type DetailRowProps = {
  plans: string[];
  feature: {
    tooltip?: string;
    title: string;
  };
  featureDetails: {
    value?: number | string;
    type: string;
  }[];
};
const DetailPlanRow = ({ plans, feature, featureDetails }: DetailRowProps): JSX.Element => {
  const { t } = useTranslation();
  const renderCell = (
    detail: {
      value?: string;
      type: string;
    },
    index: number
  ): JSX.Element => {
    const { value, type } = detail || {};
    const plan = plans[index];

    return <PlanCell type={type} value={value} key={`${plan}_${index}`} />;
  };
  return (
    <Styled.Row>
      <Styled.Col>
        <Styled.Cell>
          {/* @ts-ignore */}
          <Tooltip title={t(feature.tooltip)}>
            <div>
              <Styled.Text $tooltip={Boolean(t(feature.tooltip))}>{t(feature.title)}</Styled.Text>
            </div>
          </Tooltip>
        </Styled.Cell>
      </Styled.Col>
      {featureDetails.map(renderCell)}
    </Styled.Row>
  );
};

export default DetailPlanRow;
