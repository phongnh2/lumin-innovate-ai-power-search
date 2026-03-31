import styled from "styled-components";

export const PreviewText = styled.span``;

export const PreviewField = styled.div`
  display: var(--display);
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 45;
  cursor: none;
  pointer-events: none;
  padding: calc(var(--zoom) * var(--stroke-thickness));
  outline: dashed calc(var(--zoom) * var(--stroke-thickness)) var(--stroke-color);
  background-color: var(--fill-color);

  ${PreviewText} {
    color: var(--text-color);
    font-family: var(--font);
    font-size: calc(var(--font-size) * var(--zoom));
    line-height: 115%;
    font-weight: var(--font-weight);
    font-style: var(--font-style);
    text-decoration: var(--text-decoration);
  }
`;
