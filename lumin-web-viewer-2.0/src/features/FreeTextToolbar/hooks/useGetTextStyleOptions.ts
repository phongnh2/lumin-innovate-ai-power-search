import { useMemo } from 'react';

import { CUSTOM_FONTS_V2 } from '@new-ui/general-components/TextStylePalette/constants';

import { array as arrayUtils } from 'utils';

import { MAX_FONT_SIZE, MIN_FONT_SIZE } from 'constants/contentEditTool';

import { IAnnotationStyle } from 'interfaces/viewer/viewer.interface';

interface UseGetFreeTextFontsProps {
  style: IAnnotationStyle;
}

export const useGetTextStyleOptions = ({ style }: UseGetFreeTextFontsProps) => {
  const fonts = useMemo(() => {
    const isExternalFont = style.Font && CUSTOM_FONTS_V2.every((font) => font.value !== style.Font);
    const fontList = isExternalFont ? [{ value: style.Font, label: style.Font }, ...CUSTOM_FONTS_V2] : CUSTOM_FONTS_V2;
    return fontList.map(({ value, ...rest }) => ({
      value,
      ...rest,
    }));
  }, [style.Font]);

  const sizes = useMemo(
    () =>
      arrayUtils.createRangeArray(MIN_FONT_SIZE, MAX_FONT_SIZE).map((size: number) => ({
        value: size.toString(),
        label: `${size} pt`,
      })),
    []
  );

  return { fonts, sizes };
};
