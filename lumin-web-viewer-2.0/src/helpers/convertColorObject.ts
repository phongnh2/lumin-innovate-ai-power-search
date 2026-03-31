export type TRGBColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

const DEFAULT_COLOR = new window.Core.Annotations.Color(0, 0, 0, 1);
const DEFAULT_RGB_COLOR_OBJECT = {
  r: DEFAULT_COLOR.R,
  g: DEFAULT_COLOR.G,
  b: DEFAULT_COLOR.B,
  a: DEFAULT_COLOR.A,
};
const RGB_LENGTH = 3;
const PRIMARY_COLOR_MAX_VALUE = 255;
const PRIMARY_COLOR_MIN_VALUE = 0;
const DEFAULT_ALPHA_VALUE = 1;

/**
 * Convert Apryse color object or string color to react-color library rgb color object
 */
export const convertColorObject = (color: Core.Annotations.Color | string): TRGBColor => {
  let apryseColor: Core.Annotations.Color;

  if (!['string', 'object'].includes(typeof color) || !color) {
    return DEFAULT_RGB_COLOR_OBJECT;
  }

  if (typeof color === 'string') {
    const rgba = color
      .slice(color.indexOf('(') + 1, -1)
      .split(',')
      .map((primaryColor) => parseInt(primaryColor));

    if (
      rgba.length < RGB_LENGTH ||
      rgba.some(
        (primaryColor) =>
          !Number.isFinite(primaryColor) ||
          primaryColor < PRIMARY_COLOR_MIN_VALUE ||
          primaryColor > PRIMARY_COLOR_MAX_VALUE
      )
    ) {
      return DEFAULT_RGB_COLOR_OBJECT;
    }

    apryseColor = new window.Core.Annotations.Color(rgba[0], rgba[1], rgba[2], rgba[3] || DEFAULT_ALPHA_VALUE);
  } else {
    apryseColor = { ...color } as Core.Annotations.Color;
  }

  const { R, G, B, A } = apryseColor;

  return {
    r: R,
    g: G,
    b: B,
    a: A,
  };
};
