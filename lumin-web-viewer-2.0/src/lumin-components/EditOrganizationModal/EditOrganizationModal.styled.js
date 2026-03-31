import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
`;

export const Title = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const Label = styled.h4`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin-top: 16px;
`;

export const UploadAvatarWrapper = styled.div`
  margin-top: 12px;
`;

export const InputWrapper = styled.div`
  margin-top: 4px;
`;

export const ButtonWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: var(--border-secondary);
`;
