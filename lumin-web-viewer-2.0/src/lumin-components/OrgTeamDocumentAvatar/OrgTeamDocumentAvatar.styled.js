import styled from 'styled-components';
import { Colors } from 'constants/lumin-common';

export const StyledHeader = styled.div`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  display: flex;
  margin-top: 16px;
`;

export const StyledTitleContainer = styled.div`
  font-weight: 600;
  letter-spacing: 0.34px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-left: 16px;
  display: flex;
  flex-direction: column;
`;

export const StyledTitle = styled.span`
  font-size: 18px;
  line-height: 1.33;
  color: ${Colors.PRIMARY};
`;

export const StyledSubTitle = styled.span`
  font-size: 16px;
  line-height: 1.5;
  color: ${Colors.SECONDARY};
`;
