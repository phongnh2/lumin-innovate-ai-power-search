import styled, { css } from 'styled-components';

import ToolNames from 'constants/toolsName';

const DEFAULT_WIDTH_HEIGHT = 18;
const DEFAULT_SIGNATURE_SIZE = {
  WIDTH: 90,
  HEIGHT: 30,
};
const DEFAULT_TEXT_FIELD_SIZE = {
  WIDTH: 150,
};

export const getWidth = (toolName, zoom) => {
  switch (toolName) {
    case ToolNames.TEXT_FIELD:
      return DEFAULT_TEXT_FIELD_SIZE.WIDTH * zoom;
    case ToolNames.SIGNATURE_FIELD:
      return DEFAULT_SIGNATURE_SIZE.WIDTH * zoom;
    default:
      return DEFAULT_WIDTH_HEIGHT * zoom;
  }
};

const FormBuildTooltip = css`
  position: fixed;
  display: ${({ hide }) => (hide ? 'none' : 'block')};
  z-index: 45;
  opacity: 0.5;
  cursor: none;
  pointer-events: none;
`;

export const HorizontalLine = styled.div`
  ${FormBuildTooltip}
  height: 0px;
  border: 1px solid var(--color-primary-60);
`;

export const VerticalLine = styled.div`
  ${FormBuildTooltip}
  width: 0px;
  border: 1px solid var(--color-primary-60);
`;
