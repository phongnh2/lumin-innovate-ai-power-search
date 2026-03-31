import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { Button, Colors, Icomoon, Text } from '@/ui';
import { Fonts } from '@/ui/utils/font.enum';

export const sectionCss = css`
  background: ${Colors.WHITE};
  margin: 0 auto;
  max-width: 640px;
  padding: 24px;
  border-radius: 16px;
`;

export const MainTitle = styled.p`
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: 140%;
  text-align: center;
  margin-bottom: 8px;
`;

export const UserEmail = styled.p`
  color: ${Colors.NEUTRAL_80};
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  text-align: center;
`;

export const NotYou = styled.p`
  color: ${Colors.NEUTRAL_80};
  font-weight: 500;
  font-size: 14px;
  font-style: normal;
  line-height: 140%;
  margin-bottom: 40px;
  text-align: center;
  text-decoration: underline;
  cursor: pointer;
  width: fit-content;
  user-select: none;
`;

export const Title = styled(Text)`
  font-weight: 600;
  margin-bottom: 12px;
  font-family: ${Fonts.Secondary};
`;

export const Scopes = styled.div``;

export const ClientImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: contain;
`;

export const ScopeWrapper = styled(Accordion)<{ emotion?: { $isLastItem: boolean } }>`
  box-shadow: none;
  border-bottom: ${({ emotion }) => (emotion?.$isLastItem ? 'none' : 'solid 1px #dbdde1')};
  &:before {
    display: none;
  }
  padding: 16px 0;
`;

export const ScopeSummary = styled(AccordionSummary)`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  color: #192833;
  padding: 0;
  margin-top: 4px 0;
  font-family: ${Fonts.Secondary};
  min-height: 0;
`;

export const ScopeDetail = styled(AccordionDetails)`
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  color: #71787e;
  align-items: center;
  padding: 8px 0 0 32px;
  font-family: ${Fonts.Secondary};
`;

export const ScopeDetailWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ConnectedLogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  position: relative;
`;

export const LinkIcon = styled(Icomoon)`
  position: absolute;
  padding: 4px;
  border-radius: 200px;
  border: solid 1px #dbdde1;
  background: ${Colors.WHITE};
  top: 25%;
`;

export const ButtonGroup = styled.div`
  display: flex;
  margin-top: 32px;
  flex-direction: column;
`;

export const AllowButton = styled(Button)`
  background-color: #1e3342 !important;
  font-family: ${Fonts.Secondary};
`;

export const DenyButton = styled(Button)`
  margin-top: 16px;
  font-family: ${Fonts.Secondary};
`;

export const NoteWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 24px;
`;

export const NoteTitle = styled(Text)`
  font-weight: 700;
  font-size: 11px;
  font-family: ${Fonts.Secondary};
`;

export const NoteDescription = styled(Text)`
  font-weight: 400;
  font-size: 11px;
  color: #71787e;
  margin-top: 4px;
  font-family: ${Fonts.Secondary};

  a {
    color: ${Colors.NEUTRAL_80};
    font-weight: 500;
    font-size: 14px;
    font-style: normal;
    line-height: 140%;
    margin-bottom: 40px;
    text-align: center;
    text-decoration: underline;
    cursor: pointer;
    width: fit-content;
    user-select: none;
  }
`;
