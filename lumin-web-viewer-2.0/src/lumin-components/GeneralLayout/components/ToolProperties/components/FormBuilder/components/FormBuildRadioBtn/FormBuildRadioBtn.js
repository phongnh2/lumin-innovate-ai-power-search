import React from 'react';

import RadioBtnFieldName from './RadioBtnFieldName';
import * as Styled from '../../FormBuilder.styled';
import FieldDimensionComponent from '../shared-components/FieldDimension';
import FieldProperties from '../shared-components/FieldProperties';

export const FormBuildRadioBtn = () => (
  <>
    <Styled.BaseSection>
      <RadioBtnFieldName />
    </Styled.BaseSection>

    <Styled.BaseSection>
      <FieldProperties />
    </Styled.BaseSection>

    <Styled.BaseSection>
      <FieldDimensionComponent squaredField />
    </Styled.BaseSection>
  </>
);

export default FormBuildRadioBtn;
