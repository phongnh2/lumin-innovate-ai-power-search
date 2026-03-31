import { styledPropConfigs } from 'utils/styled';
import { Colors } from 'constants/styles';
import styled from 'styled-components';

export const Header = styled.div`
  height: 48px;
  background-color: var(--color-primary-80);
  padding: 0 16px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content max-content;
  column-gap: 20px;
  align-items: center;
`;

export const HeaderText = styled.h6`
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: ${Colors.WHITE};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
`;

export const UploadingIcon = styled.img`
  width: 20px;
  height: 20px;
`;

export const HeaderButton = styled.button`
  width: 18px;
  height: 18px;
  cursor: pointer;
  background-color: transparent;
  outline: none;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const CollapseButton = styled(HeaderButton).withConfig(styledPropConfigs(['isCollapsing']))`
  transition: transform 0.3s ease;
  transform: rotate(${({ isCollapse }) => (isCollapse ? '0' : '180deg')});
`;
