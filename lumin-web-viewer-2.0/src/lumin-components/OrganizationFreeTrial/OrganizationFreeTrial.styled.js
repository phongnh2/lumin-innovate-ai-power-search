import styled from 'styled-components';
import Icomoon from 'lumin-components/Icomoon';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CustomIcon = styled(Icomoon)`
  margin: 0 0 4px 12px;
  ${mediaQuery.md`
    margin-left: 20px;
  `}
`;
