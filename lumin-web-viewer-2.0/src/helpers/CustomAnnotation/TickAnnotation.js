import { CUSTOM_ANNOTATION, CUSTOM_ANNOTATION_MIN_SIZE } from 'constants/documentConstants';

import { LuminCustomAnnotation } from './LuminCustomAnnotation';

class TickAnnotation extends LuminCustomAnnotation {
  constructor() {
    super(CUSTOM_ANNOTATION.TICK.name); // provide the custom XFDF element name
    this.Subject = CUSTOM_ANNOTATION.TICK.subject;
    this.MaintainAspectRatio = true;
    this.ToolName = CUSTOM_ANNOTATION.TICK.tool;
  }

  draw(ctx, pageMatrix) {
    this.setStyles(ctx, pageMatrix);
    const size = Math.max(this.Width, this.Height, CUSTOM_ANNOTATION_MIN_SIZE);
    let height = this.Height;
    let width = this.Width;
    const isLandscape = [90, 270].includes(this.Rotation);
    if (isLandscape) {
      height = this.Width;
      width = this.Height;
    }
    if (height !== 0.75 * width) {
      height = size * 0.75;
      width = size;
    }

    this.Height = isLandscape ? width : height;
    this.Width = isLandscape ? height : width;
    const rotationAngle = window.Core.Annotations.RotationUtils.getRotationAngleInRadiansByDegrees(this.Rotation);
    const unrotatedBoundingBox = window.Core.Annotations.RotationUtils.getUnrotatedDimensionsFromRectangularAnnotations(
      this.getRect(),
      rotationAngle
    );
    ctx.beginPath();
    ctx.translate(
      unrotatedBoundingBox.x + unrotatedBoundingBox.width / 2,
      unrotatedBoundingBox.y + unrotatedBoundingBox.height / 2
    );
    ctx.rotate(-rotationAngle);
    ctx.translate(-unrotatedBoundingBox.width / 2, -unrotatedBoundingBox.height / 2);
    const padding = size > this.StrokeThickness ? this.StrokeThickness / 3 : 0;
    ctx.moveTo(padding, unrotatedBoundingBox.height / 2);
    ctx.lineTo(
      unrotatedBoundingBox.width / 3,
      unrotatedBoundingBox.height -
        (this.StrokeThickness > unrotatedBoundingBox.height ? 0 : this.StrokeThickness) * 0.75
    );
    ctx.lineTo(unrotatedBoundingBox.width - padding, padding);
    ctx.stroke();
  }
}

export default TickAnnotation;
