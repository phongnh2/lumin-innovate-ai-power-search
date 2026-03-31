import styled from 'styled-components';
import { Colors } from 'constants/lumin-common';

export const StyledHeader = styled.div`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  display: flex;
`;

export const StyledName = styled.span`
  font-size: 18px;
  font-weight: 600;
  line-height: 1.33;
  letter-spacing: 0.34px;
  color: ${Colors.PRIMARY};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-left: 10px;
  display: inline-block;
`;
