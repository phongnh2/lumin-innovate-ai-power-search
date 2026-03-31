import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar as AvatarBase } from '@mui/material';

import { SizeResolution, mediaQueryUp } from '../utils';

import { TAvatarProps } from './interfaces';
import { AvatarSizeTransformer } from './utils/avatare-size-transformer';

export const NameText = styled.span`
  color: white;
  font-weight: 600;
`;

export const Container = styled(AvatarBase)<Pick<TAvatarProps, 'size'> & { backgroundcolor: string }>(({ size, backgroundcolor }) => {
  const transformer = new AvatarSizeTransformer(size);
  const mobileSize = transformer.get<number>(SizeResolution.Mobile);
  const tabletSize = transformer.get<number>(SizeResolution.Tablet);
  const desktopSize = transformer.get<number>(SizeResolution.Desktop);
  return css`
    position: relative;
    overflow: hidden;
    display: inline-flex;
    border-radius: 9999px;
    background-color: ${backgroundcolor};
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    width: ${mobileSize}px;
    height: ${mobileSize}px;
    ${NameText} {
      font-size: ${mobileSize / 2.25}px;
    }
    ${mediaQueryUp.md} {
      width: ${tabletSize}px;
      height: ${tabletSize}px;
      ${NameText} {
        font-size: ${tabletSize / 2.25}px;
      }
    }
    ${mediaQueryUp.xl} {
      width: ${desktopSize}px;
      height: ${desktopSize}px;
      ${NameText} {
        font-size: ${desktopSize / 2.25}px;
      }
    }
  `;
});

export const Avatar = styled('img')`
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  width: 100%;
  height: 100%;
`;
