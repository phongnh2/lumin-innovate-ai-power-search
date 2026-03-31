import styled, { keyframes } from 'styled-components';

import CheckboxV2 from '@new-ui/general-components/Checkbox';

import { typographies } from 'constants/styles/editor';

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  hr {
    margin: 0;
  }
`;

export const ContentWrapper = styled.div`
  flex-grow: 1;
  padding: var(--kiwi-spacing-2) var(--kiwi-spacing-1-5);
  overflow: hidden auto;
`;

export const ConsentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--kiwi-spacing-2) var(--kiwi-spacing-1-5);
`;

export const BottomWrapper = styled.div<{ $isSummarizing: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ $isSummarizing }) =>
    $isSummarizing
      ? `
    padding: var(--kiwi-spacing-2) var(--kiwi-spacing-1-5);
  `
      : `
    padding: var(--kiwi-spacing-2) var(--kiwi-spacing-1-5) var(--kiwi-spacing-2) var(--kiwi-spacing-0-5);
  `};
`;

export const Text = styled.span`
  ${typographies.le_body_medium};
  color: ${({ theme }) => `${theme.le_main_on_surface}`};
`;

export const TextSm = styled.span`
  ${typographies.le_body_small};
  color: ${({ theme }) => `${theme.le_main_primary}`};
`;

export const List = styled.ul`
  list-style: none;
  margin-bottom: var(--kiwi-spacing-3);
`;

export const AdvanceListItem = styled.li`
  position: relative;
  padding-left: var(--kiwi-spacing-2);
  &::after {
    content: '';
    position: absolute;
    top: var(--kiwi-spacing-1);
    left: var(--kiwi-spacing-0-5);
    width: 5px;
    height: 5px;
    background: ${({ theme }) => `${theme.le_main_on_surface}`};
    border-radius: 50%;
  }
`;

export const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoadingSplitedTextKeyframe = keyframes`
  0%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(4px);
    opacity: 0.8;
  }
`;

export const MediumVariantText = styled.span`
  ${typographies.le_body_medium};
  color: ${({ theme }) => `${theme.le_main_on_surface_variant}`};
`;

export const LoadingTextSplited = styled(MediumVariantText)<{ index: number }>`
  margin: 0 var(--kiwi-spacing-0-25);
  animation: ${LoadingSplitedTextKeyframe} ease-in-out 1.4s infinite;
  animation-delay: ${({ index }) => index * 0.2}s;
`;

export const LoadingContent = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
`;

const LoadingDotKeyframe = keyframes`
  0% { 
    opacity: 1;
  }
  50% { 
    opacity: 0;
    transform: translateY(4px);
  }
  100% { 
    opacity: 1;
  }
`;

export const LoadingDot = styled.div`
  animation: ${LoadingDotKeyframe} ease-in-out 1.4s infinite;
  background-color: ${({ theme }) => `${theme.le_main_on_surface_variant}`};
  display: inline-block;
  height: 2.5px;
  margin: 1px 1px 0;
  width: 2.5px;

  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
`;

export const Image = styled.img`
  height: 80px;
  margin: 0 auto var(--kiwi-spacing-1) auto;
`;

export const ConsentLink = styled.a`
  ${typographies.le_body_medium};
  cursor: pointer;
  text-decoration: underline;
  color: ${({ theme }) => `${theme.le_main_on_surface}`};
`;

export const LoadingLink = styled.a`
  ${typographies.le_body_small};
  cursor: pointer;
  text-decoration: underline;
  color: ${({ theme }) => `${theme.le_main_primary}`};
`;

export const FooterLoadingText = styled.span`
  ${typographies.le_body_small};
  color: ${({ theme }) => `${theme.le_main_on_surface_variant}`};
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  margin: var(--kiwi-spacing-1) 0;

  ${Text} {
    padding-top: var(--kiwi-spacing-0-5);
    padding-left: var(--kiwi-spacing-0-5);
  }
`;

export const Box = styled(CheckboxV2)<{ type: string; onChange: () => void }>`
  margin-left: calc(var(--kiwi-spacing-1) * -1);
`;

export const FeedbackLink = styled.a`
  background-color: transparent;
  color: ${({ theme }) => `${theme.le_main_primary}`};
  padding: var(--kiwi-spacing-1-5) var(--kiwi-spacing-1-5);
  border-radius: var(--border-radius-primary);
  transition: background-color 0.25s;

  text-align: center;
  ${typographies.le_label_large};

  &:hover {
    background-color: ${({ theme }) => `${theme.le_state_layer_primary_hovered}`};
  }
`;

export const SummarizePopper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--kiwi-spacing-2);
  background: ${({ theme }) => theme.kiwi_colors_surface_surface_bright};

  max-width: 304px;
`;

export const PopperSvg = styled.div`
  padding: var(--kiwi-spacing-1);
`;

export const PopperTitle = styled.span`
  padding: var(--kiwi-spacing-2) 0;
  ${{ ...typographies.le_title_medium }};
  color: ${({ theme }) => `${theme.le_main_on_surface}`};
`;

export const PopperDesc = styled.span`
  margin: 0 var(--kiwi-spacing-1) var(--kiwi-spacing-2);
  text-align: center;
  ${{ ...typographies.le_body_medium }};
  color: ${({ theme }) => `${theme.le_main_on_surface}`};
`;

export const PopperButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--base-gap-2x);
  width: 100%;
`;
