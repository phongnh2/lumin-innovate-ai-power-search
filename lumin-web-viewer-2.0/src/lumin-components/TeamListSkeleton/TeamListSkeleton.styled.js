import styled from 'styled-components';

import * as Styled from 'lumin-components/TeamItemGrid/TeamItemGrid.styled';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const SkeletonListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(328px, 1fr));
  gap: 16px;
  box-sizing: border-box;
  margin-top: 16px;
  ${mediaQuery.md`
    grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
    gap: 24px;
    margin-top: 32px;
  `}
  ${mediaQuery.xl`
    gap: 16px;
    margin-top: 16px;
  `}
`;

export const ItemContainer = styled.div`
  padding: 16px;
  border: 1px solid ${Colors.NEUTRAL_30};
  box-sizing: border-box;
  border-radius: var(--border-radius-primary);
  ${mediaQuery.md`
    padding: 16px 24px 24px;
  `}
  ${mediaQuery.xl`
    padding: 24px 24px 40px;
  `}
`;

export const ItemContent = styled(Styled.ItemContent)`
  gap: 8px;
  ${mediaQuery.md`
    gap: 17px 12px;
  `}
  ${mediaQuery.xl`
    gap: 12px;
    padding-top: 8px;
  `}
`;
