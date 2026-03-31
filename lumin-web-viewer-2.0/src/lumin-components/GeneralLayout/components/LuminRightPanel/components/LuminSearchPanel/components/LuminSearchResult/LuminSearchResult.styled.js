import styled from 'styled-components';
import { typographies } from 'constants/styles/editor';

export const SearchResult = styled.div`
  margin-top: 8px;
  padding: 8px;
  cursor: pointer;
  user-select: none;
  width: 100%;
  border-radius: var(--border-radius-primary);
  border: 1px solid transparent;
  ${({...typographies.le_body_small})};
  ${({ theme }) =>
  `
    background-color: ${theme.le_main_surface_container_lowest};
    color:  ${theme.le_main_on_surface_variant};
  `}

  ${({ theme, $selected }) => $selected &&
  `
    border: 1px solid  ${theme.le_main_primary};
  `}
`;

export const SearchValue = styled.span`
  ${({ theme }) =>
  `
    color: ${theme.le_main_on_surface};
  `}
  font-weight: bold;
`;
