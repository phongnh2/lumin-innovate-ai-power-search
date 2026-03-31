import { CropDimensionType, GetCropDimensionsType } from '../types';

export const usePageBoxDimensions = () => {
  const validatePageBoxDimensions = (props: GetCropDimensionsType): CropDimensionType => {
    const { cropDimension, currentAnnotation, pageInfo } = props;

    const left = Math.min(cropDimension.left ?? currentAnnotation.X, pageInfo.width);
    const top = Math.min(cropDimension.top ?? currentAnnotation.Y, pageInfo.height);

    const maxWidth = pageInfo.width - left;
    const maxHeight = pageInfo.height - top;

    const width = Math.min(cropDimension.width ?? currentAnnotation.Width, maxWidth);
    const height = Math.min(cropDimension.height ?? currentAnnotation.Height, maxHeight);
    const right = pageInfo.width - left - width;
    const bottom = pageInfo.height - top - height;

    return { left, top, width, height, bottom, right };
  };

  const getRectByPageBoxDimensions = (
    props: GetCropDimensionsType
  ): Pick<Core.Math.Quad, 'x1' | 'y1' | 'x2' | 'y2'> => {
    const { validDimension } = props;

    return {
      x1: validDimension.left,
      y1: validDimension.top,
      x2: validDimension.left + validDimension.width,
      y2: validDimension.top + validDimension.height,
    };
  };

  return { validatePageBoxDimensions, getRectByPageBoxDimensions };
};
