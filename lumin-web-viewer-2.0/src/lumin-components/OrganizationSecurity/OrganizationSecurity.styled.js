import styled from 'styled-components';
import { withStyles } from '@mui/styles';
import { Button } from '@mui/material';

import SharedFormControlLabel from 'lumin-components/Shared/FormControlLabel';

import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';


export const OrganizationWrapper = styled.section`
  box-sizing: border-box;
`;

export const ButtonAddDomain = withStyles({
  root: ({ disabled, rootStyle }) => ({
    borderRadius: 'var(--border-radius-primary)',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: Colors.NEUTRAL_10,
    },
    ...disabled && {
      '&.Mui-disabled': {
        color: Colors.WHITE,
        opacity: 0.6,
        cursor: 'not-allowed',
        pointerEvents: 'auto',
      },
    },
    ...rootStyle,
  }),
})(Button);

export const Title = styled.h3`
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  padding-left: 24px;
  margin-bottom: 12px;
`;

export const Container = styled.div`
  margin-bottom: 24px;
  padding: 16px 24px;
  background-color: ${Colors.NEUTRAL_5};
  border-radius: var(--border-radius-primary);
`;

export const FormControlLabel = styled(SharedFormControlLabel)`
  align-items: flex-start;
  margin-left: 0;

  &:not(:last-child) {
    margin-bottom: 16px;

    ${mediaQuery.xl`
      margin-bottom: 24px;
    `}
  }
`;

export const ListWrapper = styled.div`
  margin-left: 18px;
`;

export const BadgeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TitleWrapper = styled(BadgeWrapper)`
  margin-bottom: 4px;
`;

export const Label = styled.h3`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
`;

export const Description = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
`;

export const Wrapper = styled.div`
  height: auto;
  margin-top: 20px;
  padding-top: 20px;
  border-top: var(--border-secondary);

  ${mediaQuery.xl`
    margin-top: 24px;
    padding-top: 16px;
  `}
`;

export const ButtonAddDomainWrapper = styled(BadgeWrapper)`
  width: max-content;
`;

export const TextButtonAddDomain = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.SECONDARY_50};
  margin-left: 12px;
`;

export const LearnMore = styled.a`
  color: ${Colors.NEUTRAL_100};
  font-weight: 600;
  text-decoration: underline;
`;

export const DescriptionWrapper = styled.div`
  margin-bottom: 16px;
`;