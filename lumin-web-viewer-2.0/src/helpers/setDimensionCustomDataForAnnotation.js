import { CUSTOM_DATA_DIMENSION, CUSTOM_DATA_COORDINATE } from "constants/customDataConstant";
import { ANNOTATION_SUBJECT_NEED_TO_TRANSFORM } from "constants/documentConstants";

const setDimensionCustomDataForAnnotation = (annotations) => {
  annotations
    .filter((annot) => ANNOTATION_SUBJECT_NEED_TO_TRANSFORM.includes(annot.Subject))
    .forEach((annot) => {
      const data = JSON.stringify({
        height: annot.Height,
        width: annot.Width,
      });

      const dataCoordinate = JSON.stringify({
        X: annot.X,
        Y: annot.Y,
      });

      annot.setCustomData(CUSTOM_DATA_DIMENSION.key, data);
      // NOTE: custom data for coordinate
      annot.setCustomData(CUSTOM_DATA_COORDINATE.key, dataCoordinate);
    });
};

export default setDimensionCustomDataForAnnotation;