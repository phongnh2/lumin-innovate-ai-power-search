import styled from 'styled-components';

import { typographies, spacings } from 'constants/styles/editor';

export const ResultWrapper = styled.div`
  padding: ${spacings.le_gap_1}px;
  background: ${({ theme }) => `${theme.le_main_surface_container}`};
  border-radius: var(--border-radius-primary);
`;

export const ResultGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const ResponseFeedback = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 40px;
  border-radius: var(--border-radius-primary);
  padding: ${spacings.le_gap_1_5}px ${spacings.le_gap_1}px;
  background: ${({ theme }) => `${theme.le_main_primary_container}`};
`;

export const Question = styled.span`
  ${typographies.le_body_medium};
  color: ${({ theme }) => `${theme.le_main_on_surface}`};
`;

export const PrimaryText = styled.span`
  ${typographies.le_body_small};
  color: ${({ theme }) => `${theme.le_main_on_primary_container}`};
`;

export const ResultMain = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const SummarizeData = styled.div`
  ${typographies.le_body_medium};
  color: ${({ theme }) => `${theme.le_main_on_surface}`};
  ul {
    list-style: revert;
    li {
      margin-left: ${spacings.le_gap_2}px;
    }
  }

  strong,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: var(--font-weight-bold);
  }
`;

export const CopyButton = styled.div`
  margin: ${spacings.le_gap_1}px 0;
  button {
    color: ${({ theme }) => `${theme.kiwi_colors_core_secondary}`};
  }
`;

export const ResultFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacings.le_gap_0_5}px ${spacings.le_gap_0_25}px ${spacings.le_gap_0_5}px ${spacings.le_gap_0_5}px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;

  .disabled {
    cursor: not-allowed;
    &:hover {
      background: ${({ theme }) => `${theme.le_main_primary_container}`};
    }
  }
`;

export const Image = styled.img`
  padding-bottom: ${spacings.le_gap_1}px;
`;
