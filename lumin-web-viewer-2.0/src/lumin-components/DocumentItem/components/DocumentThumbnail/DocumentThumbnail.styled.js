import { Img } from 'react-image';
import styled from 'styled-components';

export const StyledThumbnail = styled(Img)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const StyledThumbnailDefault = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-primary-80);
`;
export const StyledImg = styled.img`
  object-fit: cover;
`;
