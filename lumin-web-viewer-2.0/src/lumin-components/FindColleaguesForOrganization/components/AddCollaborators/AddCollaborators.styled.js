import styled from 'styled-components';

import { Checkbox as SharedCheckbox } from 'lumin-components/Shared/Checkbox';
import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

const getMaxHeightContainer = (totalUsers) => {
  const maxItemInList = 5;
  const maxHeightContainer = totalUsers > maxItemInList ? 696 : 660;
  const paddingBetweenItem = 8;
  const heightItem = 56;
  const itemNotInList = maxItemInList - totalUsers;

  if (totalUsers > maxItemInList) {
    return `${maxHeightContainer}px`;
  }

  const totalHeightItemNotInList = itemNotInList * (heightItem + paddingBetweenItem);
  return `${maxHeightContainer - totalHeightItemNotInList}px`;
};

export const Container = styled.div`
  --layout-header-height: 72px;
  --step-setup-org-height: 32px;
  --margin-between-element: 80px;
  height: calc(100vh - (var(--layout-header-height) + var(--step-setup-org-height) + var(--margin-between-element)));
  max-height: ${({ $totalUsers }) => getMaxHeightContainer($totalUsers)};
  display: grid;
  grid-template-rows: min-content min-content auto min-content;

  ${mediaQuery.md`
    --step-setup-org-height: 40px;
    --margin-between-element: 82px;
  `}
`;

export const TopContent = styled.div``;

export const Title = styled.h1`
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}
`;

export const Content = styled.div`
  margin-top: 16px;

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const Label = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 8px;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 16px;
  `}

  b {
    font-weight: 600;
  }
`;

export const Description = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}

  b {
    font-weight: 600;
  }
`;

export const InputWrapper = styled.div`
  margin-top: 16px;

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const InputLabel = styled.p`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  margin-bottom: 4px;
`;

export const List = styled.div`
  height: 100%;
  overflow-y: auto;
`;

export const SelectAllWrapper = styled.div`
  padding-right: 16px;
  margin: 16px 0 10px;
  display: flex;
  justify-content: right;
`;

export const SelectAllText = styled.h5`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  margin-right: 18px;
`;

export const ItemWrapper = styled.label`
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: ${Colors.NEUTRAL_0};
  border-radius: var(--border-radius-primary);
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${Colors.PRIMARY_20};
  }

  &:not(:first-child) {
    margin-top: 8px;
  }
`;

export const ItemContent = styled.div`
  display: flex;
`;

export const ItemInfo = styled.div`
  margin-left: 12px;
`;

export const ItemName = styled.p`
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  word-break: break-word;

  ${({ $isPending }) => $isPending && `
    color: ${Colors.SECONDARY_50};
  `}
`;

export const ItemEmail = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
`;

export const Checkbox = styled(SharedCheckbox)`
  padding: 0;
  flex-shrink: 0;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  margin-bottom: 16px;
  align-items: center;
  position: sticky;
  bottom: 0;
  z-index: 1;

  ${mediaQuery.md`
    flex-direction: row;
  `}
`;

export const Button = styled(ButtonMaterial)`
  width: 100%;

  ${mediaQuery.md`
    max-width: 232px;
  `}
`;

export const Link = styled.p`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_70};
  margin-top: 16px;
  cursor: pointer;

  &:hover {
    text-decoration-line: underline;
  }

  ${mediaQuery.md`
    margin-top: 0;
    margin-left: 24px;
  `}
`;
