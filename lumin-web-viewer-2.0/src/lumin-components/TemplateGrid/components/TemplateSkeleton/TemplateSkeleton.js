import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';
import { Colors } from 'constants/styles';

import * as Styled from './TemplateSkeleton.styled';

const TemplateSkeleton = () => (
  <div>
    <Styled.Container>
      <Styled.Body />
    </Styled.Container>
    <Skeleton
      variant="text"
      color={Colors.NEUTRAL_10}
      style={{ marginTop: 8 }}
    />
    <Skeleton
      variant="text"
      color={Colors.NEUTRAL_10}
      style={{ marginTop: 4, width: '80%' }}
    />
  </div>
);

TemplateSkeleton.propTypes = {

};

export default TemplateSkeleton;
