import React from 'react';

import FieldDimensionComponent from './shared-components/FieldDimension';
import FieldName from './shared-components/FieldName';
import FieldProperties from './shared-components/FieldProperties';
import * as Styled from '../FormBuilder.styled';

const FormBuildSignature = () => (
  <>
    <Styled.BaseSection>
      <FieldName />
    </Styled.BaseSection>

    <Styled.BaseSection>
      <FieldProperties />
    </Styled.BaseSection>

    <Styled.BaseSection>
      <FieldDimensionComponent />
    </Styled.BaseSection>
  </>
);

export default FormBuildSignature;
