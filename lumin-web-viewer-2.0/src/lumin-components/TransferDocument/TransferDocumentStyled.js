import { Link } from 'react-router-dom';
import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import Alert from 'luminComponents/Shared/Alert';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors, Fonts } from 'constants/styles';

export const LoadingIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const Header = styled.div`
  display: flex;
  margin-bottom: 16px;
  align-items: center;
  ${mediaQuery.sm`
    font-size: 24px;
  `}
`;
export const ErrorStyled = styled(Alert)`
  margin-bottom: 16px;
`;
export const HeaderText = styled.h2`
  font-size: 14px;
  font-weight: 600;
  margin-right: 12px;
  font-family: ${Fonts.PRIMARY};
  color: ${(props) => props.theme.MOVE_DOCUMENT_MODAL.HEADER_TEXT};
  ${mediaQuery.sm`
    font-size: 20px;
  `}
`;

export const ButtonGroup = styled.div`
  margin-top: 16px;
`;

export const ExpandedItem = styled(ButtonMaterial)`
  && {
    display: flex;
    align-items: center;
    background-color: ${({ selected, theme }) =>
      selected ? theme.MOVE_DOCUMENT_MODAL.EXPANDED_ITEM_SELECTED : 'transparent'};
    width: 100%;
    border-radius: unset;
    justify-content: flex-start;
    padding: 0;
    height: 100%;
    &:hover {
      background-color: ${({ theme }) => theme.MOVE_DOCUMENT_MODAL.EXPANDED_ITEM_HOVER};
    }
    margin-bottom: ${({ $isLastItem, $fixed }) => ($isLastItem && !$fixed ? '10px' : '')};
  }
`;

export const ExpandedItemContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : '90%')};
  justify-content: space-between;
`;

export const ExpandedItemMainContent = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 90%;
  .ExpandedItem__Avatar-disabled {
    opacity: 0.5;
  }
`;

export const ExpandedTitleContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export const ExpandedTitle = styled.div`
  ${({ isBreadcrumbExists }) => (!isBreadcrumbExists ? 'margin-top: 16px;' : '')}
  margin-bottom: 8px;
  display: flex;
  font-weight: 600;
  line-height: 16px;
  font-size: 12px;
  font-family: ${Fonts.PRIMARY};
  color: ${(props) => props.theme.MOVE_DOCUMENT_MODAL.EXPANDED_TITLE};
  text-transform: uppercase;
`;

export const Text = styled.p`
  font-weight: ${({ notFound }) => (notFound ? 400 : 600)};
  line-height: 20px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.34px;
  font-size: 14px;
  font-family: ${Fonts.PRIMARY};
  color: ${({ disabled, theme }) =>
    disabled ? theme.MOVE_DOCUMENT_MODAL.FOLDER_TITLE_DISABLED : theme.MOVE_DOCUMENT_MODAL.FOLDER_TITLE};
  padding-left: 12px;
  text-align: start;
  ${mediaQuery.md`
    font-size: 14px;
  `}
`;

export const BreadcrumbWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

export const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  padding-top: var(--kiwi-spacing-1-5);
  margin-bottom: var(--kiwi-spacing-1-5);
  width: 90%;
`;

export const BreadcrumbItemContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: ${({ level }) => (level > 1 ? '33%' : '66%')};
`;

export const SearchWrapper = styled.div`
  width: 100%;
  margin-bottom: 8px;
  margin-top: 12px;
`;

export const ArrowIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border-radius: 8px;
  padding: 10px;
  transition: background-color 0.3s ease;
  color: ${({ theme }) => theme.COPY_DOCUMENT.DESTINATION_ITEM.ICON_COLOR};
  :hover {
    background-color: ${({ theme }) => theme.COPY_DOCUMENT.DESTINATION_ITEM.ARROW_HOVER};
  }
`;

export const OrgTextNotificationContainer = styled.div`
  display: flex;
  align-items: center;
  padding-top: 8px;
`;

export const TextNotification = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  padding-left: 8px;
`;

export const CustomLink = styled(Link)`
  font-weight: 600;
  color: ${Colors.SECONDARY_50};
  text-decoration: underline;
`;
