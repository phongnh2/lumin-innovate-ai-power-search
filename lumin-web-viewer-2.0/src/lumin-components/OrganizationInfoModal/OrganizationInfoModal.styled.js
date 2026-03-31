import styled from 'styled-components';

import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import ModalFooter from 'lumin-components/ModalFooter';

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const Title = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const Group = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: 12px;

  ${({ $notMarginBottom }) => $notMarginBottom && `
    margin-bottom: 0;
  `}

  ${mediaQuery.md`
    margin-bottom: 16px;

    ${({ $notMarginBottom }) => $notMarginBottom && `
      margin-bottom: 0;
    `}
  `}
`;

export const Section = styled.div`
  width: 50%;
  display: flex;
  align-items: flex-start;
`;

export const MemberSection = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .avatar {
    margin-right: 6px;

    ${mediaQuery.md`
      margin-right: 8px;
    `}
  }
`;

export const Label = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const Text = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  white-space: normal;
  word-break: break-word;
  .free {
    text-transform: capitalize;
  }

  .premium {
    text-transform: capitalize;
    color: ${Colors.SECONDARY_50};
  }

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const Divider = styled.div`
  height: 1px;
  background-color: ${Colors.NEUTRAL_20};
  margin: 16px 0;
`;

export const Button = styled(ModalFooter)`
  width: 100%;

  ${mediaQuery.md`
    margin-top: 16px;
  `}
`;

export const Members = styled.div`
  height: 25px;
  margin-top: 8px;
  display: flex;
`;
export const RemainingText = styled.div`
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_60};
`;
