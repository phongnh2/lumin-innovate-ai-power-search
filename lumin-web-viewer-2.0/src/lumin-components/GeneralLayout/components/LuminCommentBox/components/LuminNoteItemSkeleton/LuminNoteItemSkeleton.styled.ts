import styled from 'styled-components';
import { spacings } from 'constants/styles/editor';

export const Container = styled.div`
  padding: ${spacings.le_gap_1_5}px;
`

export const Wrapper = styled.div`
  padding: ${spacings.le_gap_2}px;
  width: 100%;
  min-height: 68px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  margin-bottom: ${spacings.le_gap_2}px;
  ${({theme}) => `
    background-color: ${theme.le_main_surface_container_lowest};
  `}
`;

export const HeaderWrapper = styled.div`
  pointer-events: none;
  display: flex;
  justify-content: flex-start;
  margin-right: 13px;
  border-radius: var(--border-radius-dense);
`;

const AlignItem =styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  flex-direction: column;
`;

export const DetailsWrapper = styled(AlignItem)`
  margin-left: ${spacings.le_gap_1}px;
`;

export const ContentWrapper = styled(AlignItem)`
  width: 100%;
  margin-top: ${spacings.le_gap_1}px;
`;

