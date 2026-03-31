import styled, { css } from 'styled-components';
import { withStyles } from '@mui/styles';
import { ListItem, List } from '@mui/material';
import { mediaQuery } from 'utils/styles/mediaQuery';
import Icomoon from 'luminComponents/Icomoon';
import { Fonts } from 'constants/styles';

const overflowElipssisStyles = (props) => props.textWrap === 'nowrap' && css`
  display: inline-block;
  /* max-width: calc(100% - 32px); */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const StyledButtonWrapper = styled.span`
  border: 1px solid var(--color-primary-50);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  padding: 12px;
  width: 100%;
  justify-content: space-between;
  position: relative;
  ${mediaQuery.md`
    padding: 14px;
  `}
  ${(props) => props.useInInput && `
    width: 100%;
    padding: 0 12px;
    justify-content: center;
  `}

`;

export const StyledLabelWrapper = styled.div`
  color: ${({ theme }) => theme.COPY_DOCUMENT.TEXT_COLOR};
  display: flex;
  align-items: center;
`;

export const StyledLabel = styled.span`
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 20px;
  letter-spacing: 0.34px;
  text-transform: none;
  font-family: ${Fonts.PRIMARY};
  ${overflowElipssisStyles}
  padding-left: 10px;

  ${(props) => props.useInInput && `
    display: none;
  `}

  ${mediaQuery.md`
    font-size: 14px;
    ${(props) => props.useInInput && `
      display: inline;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.43;
      letter-spacing: 0.34px;
    `}
  `}

  ${mediaQuery.xl`
    ${(props) => props.useInInput && `
      font-size: 16px;
      font-weight: 600;
      line-height: 1.5;
      letter-spacing: 0.34px;
    `}
  `}
`;

export const StyledText = styled.span`
  padding-left: 14px;
  padding-right: 16px;
  line-height: 20px;
  font-size: 14px;
  color: ${({ theme }) => theme.COPY_DOCUMENT.TEXT_COLOR};
  font-family: ${Fonts.PRIMARY};
  ${overflowElipssisStyles}
`;

export const StyledListItem = withStyles((theme) => ({
  root: {
    cursor: 'pointer',
    paddingTop: '12px',
    paddingBottom: '12px',
    '&:hover': {
      backgroundColor: theme.DROPDOWN_HOVER_BG,
    },
  },
}), { withTheme: true })(ListItem);

export const StyledList = withStyles((theme) => ({
  root: {
    maxWidth: 'calc(100vw - 32px)',
    paddingBottom: 0,
    paddingTop: 0,
    color: theme.COPY_DOCUMENT.TEXT_COLOR,
  },
}))(List);

export const StyledItemIcon = styled(Icomoon)`
  margin-right: 0px !important;
  margin-left: auto;
`;
