import styled, { keyframes } from 'styled-components';
import IconButtonBase from '@mui/material/IconButton';
import { mediaQuery } from 'utils/styles/mediaQuery';

const LoadingKeyframes = keyframes`
  100% {
    transform: translateX(100%);
  }
`;
export const Container = styled.div`
  display: grid;
  padding: 0 16px;
  grid-template-columns: max-content minmax(0, 1fr) max-content;
  column-gap: 8px;
  align-items: center;
  border-bottom: var(--border-secondary);
  box-sizing: border-box;
  width: 100%;
  height: 56px;
  color: var(--color-neutral-100);
  cursor: ${(props) => props.$clickable ? 'pointer' : 'default'};
  &:last-child {
    border-bottom: none;
  }
  &:hover .file-name  {
    text-decoration: ${(props) => props.$clickable ? 'underline' : 'unset'};
  }
`;
export const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${({ $isDefault }) => ($isDefault ? 'none' : 'cover')};
  z-index: 1;
`;
export const ThumbnailWrapper = styled.div`
  width: 32px;
  height: 32px;
  background-color: var(--color-primary-80);
  border-radius: 6px;
  border: var(--border-secondary);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
  position: relative;

  ${({ $isDefault }) => $isDefault && `
    padding: 6px 8px;
  `}

  &:before {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    animation: ${LoadingKeyframes} 1.5s infinite;
    animation-play-state: ${({ $loading }) => ($loading ? 'running' : 'paused')};
  }
`;
export const IconButton = styled(IconButtonBase)`
  color: var(--color-neutral-60);
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  flex-shrink: 0;
`;
export const ProgressBar = styled.div`
  background-color: var(--color-neutral-20);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  height: 4px;
  width: 100%;
  ${mediaQuery.md`
    max-width: 224px;
    width: auto;
    flex: 1;
  `}
  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    transition: width 1s linear;
    will-change: width;
    width: ${(props) => (props.progress)}%;
    background-color: var(--color-neutral-90);
  }
`;
export const CompressingText = styled.span`
  color: var(--color-neutral-80);
  font-size: 12px;
  line-height: 1.3;
  font-weight: 400;
  ${mediaQuery.md`
    font-size: 14px;
  `}
`;
export const FileName = styled.p`
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.42;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
export const ErrorText = styled.p`
  margin: 4px 0 0;
  font-size: 10px;
  line-height: 1.2;
  font-weight: 400;
  color: var(--color-secondary-50);
  .open-document {
    text-decoration: underline;
    cursor: pointer;
    font-style: italic;
  }
`;
export const ByteUploaded = styled.p`
  font-size: 10px;
  font-weight: 400;
  color: var(--color-neutral-80);
  line-height: 1.2;
  min-width: 0;
  margin-left: 8px;
  display: none;
  ${mediaQuery.md`
    display: block;
  `}
`;
export const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  ${mediaQuery.md`
    margin-top: 2px;
  `}
`;
export const ErrorGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
export const ActionText = styled.span`
  font-size: 10px;
  line-height: 1.2;
  font-weight: 700;
  color: var(--color-secondary-50);
  text-decoration: underline;
  cursor: pointer;
`