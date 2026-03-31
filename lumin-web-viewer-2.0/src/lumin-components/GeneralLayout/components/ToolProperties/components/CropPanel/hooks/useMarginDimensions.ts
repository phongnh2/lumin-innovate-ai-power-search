import { CropDimensionType, GetCropDimensionsType } from '../types';

export const useMarginDimensions = () => {
  const validateMarginDimensions = ({ cropDimension, pageInfo }: GetCropDimensionsType): CropDimensionType => {
    const top = Math.min(cropDimension.top ?? 0, pageInfo.height);
    const left = Math.min(cropDimension.left ?? 0, pageInfo.width);

    const maxRight = pageInfo.width - left;
    const maxBottom = pageInfo.height - top;

    const bottom = Math.min(cropDimension.bottom ?? 0, maxBottom);
    const right = Math.min(cropDimension.right ?? 0, maxRight);

    const width = pageInfo.width - left - right;
    const height = pageInfo.height - top - bottom;

    return {
      top,
      left,
      bottom,
      right,
      width,
      height,
    };
  };

  const getRectByMarginDimensions = (props: GetCropDimensionsType): Pick<Core.Math.Quad, 'x1' | 'y1' | 'x2' | 'y2'> => {
    const { validDimension, pageInfo } = props;
    return {
      x1: validDimension.left,
      y1: validDimension.top,
      x2: pageInfo.width - validDimension.right,
      y2: pageInfo.height - validDimension.bottom,
    };
  };

  return { validateMarginDimensions, getRectByMarginDimensions };
};
