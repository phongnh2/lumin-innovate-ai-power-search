import styled from 'styled-components';

export const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  ${({ isOffline }) => isOffline && (
    `
      opacity: 0.5;
      pointer-events: none;
    `
  )}
  ${({ $isViewer }) => $isViewer && (
    `
      margin-left: 8px;
    `
  )}
`;

export const RedDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  right: 0;
  background-color: var(--color-secondary-50);
  animation: notification-dot-anim 1s ease infinite alternate;
  ${({ $isViewer }) => ($isViewer ? (
    `
      top: 0;
    `
  ) : (
    `
      top: 6px;
    `
  ))}
`;
