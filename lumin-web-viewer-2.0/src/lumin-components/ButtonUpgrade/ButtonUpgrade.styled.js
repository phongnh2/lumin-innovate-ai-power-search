import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { Colors } from 'constants/styles';
import Icomoon from 'lumin-components/Icomoon';

export const ButtonUpgrade = styled(Link)`
  font-size: 14px;
  line-height: 1.43;
  transition: inherit;
  color: ${Colors.SECONDARY_50};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  padding-left: 20px;

  ${(props) => (props.$disabled ? `
    cursor: not-allowed;
    color: ${Colors.SECONDARY_30};
  ` : `
    &:hover {
      color: ${Colors.SECONDARY_60};
    }
  `)}
`;
export const IconUpgrade = styled(Icomoon)`
`;
export const StyleIcon = styled.i`
  font-size: 16px;
  transition: inherit;
`;
export const TextUpgrade = styled.span`
  margin-left: 10px;
`;
