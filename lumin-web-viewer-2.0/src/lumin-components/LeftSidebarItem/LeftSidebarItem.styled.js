import styled, { css } from 'styled-components';
import Button from '@mui/material/Button';

import Chip from 'lumin-components/Shared/Chip';

import { Colors, Fonts } from 'constants/styles';
import { styledPropConfigs } from 'utils/styled';

const buttonActiveStyles = css`
  background-color: ${Colors.PRIMARY_30};
  color: ${Colors.PRIMARY_90};
  border-color: ${Colors.PRIMARY_90};
  font-weight: 600;
`;

const nestedParentStyles = css`
  border-right: none;
  border-radius: var(--border-radius-dense);
`;

const buttonPrimaryStyles = css`
  ${(props) => props.$isActive &&
    !props.$isCollapseList &&
    css`
      font-weight: 600;
    `}
  ${(props) => props.$isActive && props.$isCollapseList && buttonActiveStyles}
  &.active {
    ${buttonActiveStyles}
    background: ${(props) => props.$nested && 'transparent'}
  }

  &:hover {
    background-color: ${Colors.PRIMARY_30};
  }
`;

const ButtonContainer = styled(Button)`
  width: 100%;
  padding: 0;
  transition: all 0.3s ease-in;
  box-sizing: border-box;
  border-radius: 0;
  display: block;
  color: ${Colors.NEUTRAL_80};

  ${(props) => (props.$isDisabled ? `
    &:not(.active) {
      opacity: 0.5;
    }

    && {
      color: inherit;
      pointer-events: none;
      cursor: default;
    }
  ` : `
    &:hover {
      background-color: transparent;
    }
  `)}
`;

export const TextName = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-size: 14px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-left: ${({ $showDocumentGuide }) => $showDocumentGuide && '24px'};
  ${({ $isBeta }) => (!$isBeta && 'width: 140px;')};
`;

export const ContainerSubItem = styled.div`
  display: flex;
  text-align: left;
  padding: 0 20px 0 12px;
  margin-left: 8px;
  align-items: center;
  text-transform: none;
  font-weight: 400;
  height: 40px;
  border-radius: var(--border-radius-dense);
  transition: background 0.25s ease;
  ${(props) => props.$nested && `
    ${TextName} {
      font-size: 12px;
      line-height: 16px;
      padding-left: 4px;
    }
  `}
`;

export const ButtonContainerPrimary = styled(ButtonContainer)`
  font-weight: 400;
  color: ${Colors.NEUTRAL_80};
  border-right: 2px solid transparent;
  ${(props) => props.$nested && nestedParentStyles}
  ${buttonPrimaryStyles}
`;

export const PrimaryWrapper = styled.div`
  margin-left: 24px;
  border-left: 1px solid ${Colors.NEUTRAL_20};
  padding: 0 8px;
`;

export const SecondaryWrapper = styled.div``;

export const ButtonContainerSecondary = styled(ButtonContainer)`
  margin-left: 24px;
  padding-right: 8px;
  width: calc(100% - 24px);
  border-left: 1px solid ${Colors.NEUTRAL_20};
  cursor: pointer;
  ${({ $showDocumentGuide }) =>
    $showDocumentGuide && `
      margin-left: 0;
      width: 100%;
    `}
  ${(props) => (props.$nested
    ? css`
      ${ContainerSubItem} {
        background-color: white;
        border-radius: 0;
      }
    `
    : css`
      &:first-child {
        margin-top: 8px;
      }

      &:last-child {
        margin-bottom: 8px;
      }
    `)}
  .icon {
    display: none;
  }

  &.active {
    ${ContainerSubItem} {
      ${buttonActiveStyles}
      border-radius: var(--border-radius-dense);
      background-color: ${({ $showDocumentGuide }) => $showDocumentGuide && Colors.PRIMARY_10};
    }

    .icon {
      display: ${({ $showDocumentGuide }) => ($showDocumentGuide ? 'none' : 'block')};
    }
  }

  &:hover {
    ${ContainerSubItem} {
      background-color: ${Colors.PRIMARY_30};
    }
  }
`;

export const Container = styled.div.withConfig(
  styledPropConfigs(['active']),
)`
  height: 40px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
  text-align: left;
  text-transform: none;
  line-height: 1;
  box-sizing: border-box;
  ${({ $nested }) => $nested &&
    css`
      padding-right: 12px;
      padding-left: 12px;
    `}

  & > .icon {
    margin-right: 12px;
  }

  & > [class^="kiwi-icon-"] {
    margin-left: calc(-1 * var(--kiwi-spacing-0-25));
    margin-right: var(--kiwi-spacing-1-25);
  }
`;

export const ArrowContainer = styled.div`
  ${({ isOpen }) => (isOpen
    ? `
      transform: rotateX(-180deg);
    `
    : '')};
  transition: all 0.3s ease-out;
  text-align: center;
  transform-origin: center center;
  flex-grow: 0;
`;

export const SidebarItemNameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BetaVersion = styled(Chip)`
  border-radius: 4px;
  border: 1px solid var(--color-neutral-80);
  padding: 2px 4px;
  
  & > span {
    font-weight: 400;
  }
`