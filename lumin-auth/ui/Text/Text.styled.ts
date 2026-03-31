import isPropValid from '@emotion/is-prop-valid';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { SizeResolution, mediaQueryUp } from '../utils';

import { TextProps } from './interfaces';
import { colorMap } from './utils';
import { TextSizeTransformer } from './utils/text-size-transformer';

type TTextSizeResult = {
  lineHeight: string;
  fontSize: string;
};

export const Text = styled('p', {
  shouldForwardProp: isPropValid
})<TextProps>(({ level = 5, align, variant: type = 'primary', bold, ellipsis = false, underline = false, fontWeight }) => {
  const transformer = new TextSizeTransformer(level);
  const mobileSize = transformer.get<TTextSizeResult>(SizeResolution.Mobile);
  const tabletSize = transformer.get<TTextSizeResult>(SizeResolution.Tablet);
  const desktopSize = transformer.get<TTextSizeResult>(SizeResolution.Desktop);
  return {
    ...mobileSize,
    fontWeight: fontWeight ?? (bold ? 600 : 400),
    ...(underline && {
      textDecoration: 'underline'
    }),
    color: colorMap.get(type),
    textAlign: align,
    ...(ellipsis && {
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }),
    '&:focus': {
      outline: 'thin dotted'
    },
    [`${mediaQueryUp.md}`]: {
      ...tabletSize
    },
    [`${mediaQueryUp.xl}`]: {
      ...desktopSize
    }
  };
});

export const buttonTextDisabledCss = css`
  opacity: 0.6;
  pointer-events: none;
`;
