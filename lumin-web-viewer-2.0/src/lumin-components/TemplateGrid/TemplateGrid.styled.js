import styled, { css } from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import MaterialSelect from 'lumin-components/MaterialSelect';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  ${(props) => props.hide &&
    css`
      display: none;
    `}
`;

export const Grid = styled.div`
  --templates-column: 2;
  display: grid;
  grid-template-columns: repeat(var(--templates-column), minmax(0, 1fr));
  gap: 24px 16px;

  ${mediaQuery.md`
    --templates-column: 3;
    gap: 32px 24px;
  `}
  ${mediaQuery.xl`
    --templates-column: 4;
    gap: 32px;
  `}
`;

export const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 32px;

  ${mediaQuery.md`
    display: grid;
    margin-top: 48px;
    grid-template-areas: 
      "page-size pagination pagination"
      "paging-description paging-description paging-description";
    gap: 20px;
  `}
  ${mediaQuery.xl`
    grid-template-areas: "page-size pagination paging-description";
    align-items: center;
  `}
`;

export const ShowMoreWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  order: 2;
  ${mediaQuery.md`
    margin-bottom: 0;
    grid-area: page-size;
  `}
`;

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 32px;
  ${mediaQuery.md`
    margin-bottom: 0;
    grid-area: pagination;
    margin-left: auto;
  `}
`;

export const ShowMore = styled.span`
  display: inline-block;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  margin-right: 12px;
`;

export const SelectPage = styled(MaterialSelect)`
  && {
    height: 40px;
    .MaterialSelect__value {
      margin-right: 16px;
      display: inline-block;
      font-size: 14px;
      line-height: 20px;
      color: ${Colors.NEUTRAL_100};
    }
  }
`;

export const PagingDescription = styled.p`
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  order: 3;
  ${mediaQuery.md`
    grid-area: paging-description;
    margin-left: auto;
  `}
`;

export const EmptyList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
`;
