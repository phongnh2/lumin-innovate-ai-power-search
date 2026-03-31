import styled from 'styled-components';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Colors, BorderRadius } from 'constants/styles';
import { mediaQuery, mediaQueryDown } from 'utils/styles/mediaQuery';
import CustomCheckbox from 'luminComponents/CustomCheckbox';
import { Link } from 'react-router-dom';

const StyledH5 = styled.h5`
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
`;

export const EntryListContainer = styled.div`
  font-size: 12px;
  line-height: 20px;
  margin-top: 24px;
  background: ${Colors.NEUTRAL_5};
  border-radius: ${BorderRadius.PRIMARY};
  padding: 16px;
  ${mediaQuery.md`
    font-size: 14px;
    padding: 16px 24px;
  `}
`;

export const Wrapper = styled.div`
  font-size: 14px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled(StyledH5)`
`;

export const ViewAllWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  color: ${Colors.SECONDARY_50};
  &:hover {
    text-decoration: underline;
  }
`;

export const Text = styled.h5`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;

export const EntryList = styled.div`
  margin-top: 16px;
`;

export const Entry = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 24px 1fr 24px;
  gap: 10px;
  &:not(:first-child) {
    margin-top: 16px;
  }
  ${mediaQuery.md`
    gap: 14px;
  `}
`;

export const EntryContent = styled.span`
  font-weight: 375;
  color: ${Colors.NEUTRAL_80};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: fit-content;
`;

export const SelectAllWrapper = styled.div`
  display: flex;
  margin-left: 2px;
  align-items: center;
  ${mediaQueryDown.md`
    margin-left: 0;
    width: 100%;
    align-items: center;
    z-index: 101;
    position: fixed;
    bottom: 0px;
    left: 0;
    height: 64px;
    background-color: ${Colors.PRIMARY_90};
    padding: 0 16px 0 18px;
    display: grid;
    grid-template-columns: 20px 1fr 40px;
  `}
`;

export const SelectedText = styled(StyledH5)`
  color: ${Colors.WHITE};
  margin-left: 10px;
  ${mediaQuery.md`
    margin-left: 18px;
    color: ${Colors.NEUTRAL_100};
  `}
`;

export const CheckBox = styled(CustomCheckbox)`
  display: flex;
  justify-content: center;
  padding: 0;
  padding: 2px;
`;

export const EmptyList = styled.div`
  margin-top: 4px;
  display: flex;
`;

export const EmptyMessage = styled.p`
  font-weight: 375;
  color: ${Colors.NEUTRAL_80};
  margin-right: 4px;
`;

export const LearnMoreLink = styled.a`
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  text-decoration: underline;
`;

export const Trash = styled.div`
  cursor: pointer;
  line-height: 0;
  padding: 3px;
`;

export const Divider = styled.div`
  width: 1px;
  height: 40px;
  background: ${Colors.NEUTRAL_20};
  margin: 0px 16px;
  ${mediaQueryDown.md`
    display: none;
  `}
`;

export const TrashText = styled(StyledH5)`
  margin-left: 12px;
  ${mediaQueryDown.md`
    display: none;
  `}
`;

export const Button = styled(ButtonMaterial)`
  width: 40px;
  min-width: auto;
  ${mediaQuery.md`
    width: auto;
  `}
`;
