import styled from 'styled-components';
import ReactScrollbars from 'react-custom-scrollbars-2';
import { makeStyles } from '@mui/styles';

import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

export const Label = styled.p`
  margin-top: 2px;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_60};

  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
  `}
`;

export const Content = styled.div`
  margin-top: 16px;
`;

export const ScrollbarContainer = styled.div`
  border-top: var(--border-secondary);
  margin-top: 8px;
  padding-top: 8px;

  ${mediaQuery.md`
    margin-top: 16px;
  `}
`;

export const Scrollbar = styled(ReactScrollbars)``;

export const RightWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
`;

export const RightText = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin-right: 8px;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const ButtonDelete = styled(ButtonMaterial)`
  min-width: 32px;
  background-color: ${Colors.WHITE};
  padding: 0;

  &:hover {
    background-color: ${Colors.NEUTRAL_10};
  }
`;

export const ButtonWrapper = styled.div`
  width: 100%;
  margin-top: 16px;
  padding-top: 16px;
  border-top: var(--border-secondary);
`;
export const useStyles = makeStyles({
  itemMember: {
    '&&': {
      paddingRight: '16px',
    },
  },
});

export const InviteGoogleContact = styled.div`
  display: flex;
  align-items: center;
`;

export const GoogleButton = styled.button`
  border-radius: 50%;
  border: none;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Logo = styled.img`
  width: 24px;
  height: 24px;
`;

export const InviteText = styled.span`
  color: ${Colors.NEUTRAL_100};
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  line-height: 20px;
  margin-right: 8px;
  font-weight: 400;
`;