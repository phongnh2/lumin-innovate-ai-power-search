import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Colors, Fonts } from 'constants/styles';

export const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  align-items: flex-end;
`;

export const Label = styled.label`
  margin-bottom: 0;
  font-size: 12px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_80};
  line-height: 16px;
`;

export const LabelReskin = styled.label`
  margin-bottom: 0;
  font-size: 12px;
  font-weight: 500;
  font-family: ${Fonts.SECONDARY};
  color: ${Colors.LUMIN_SIGN_PRIMARY};
  line-height: 12px;
`;

export const ChangeCardLink = styled(Link)`
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: ${Colors.SECONDARY_50};
  text-decoration: underline;
`;
