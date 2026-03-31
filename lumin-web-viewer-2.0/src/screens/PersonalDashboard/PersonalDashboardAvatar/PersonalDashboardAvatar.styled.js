import styled from 'styled-components';

import ChipColor from 'lumin-components/Shared/ChipColor';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
  ${mediaQuery.md`
    margin-bottom: 0;
    max-width: calc(100% - 400px);
  `}
`;

export const Name = styled.h1`
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: 0.34px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const LabelContainer = styled.div`
`;

export const InfoContainer = styled.div`
  padding: 0 16px;
  overflow: hidden;
`;

export const Chip = styled(ChipColor)`
  min-width: 60px;
`;
