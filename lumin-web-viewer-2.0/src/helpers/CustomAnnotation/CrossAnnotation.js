import { CUSTOM_ANNOTATION, CUSTOM_ANNOTATION_MIN_SIZE } from 'constants/documentConstants';

import { LuminCustomAnnotation } from './LuminCustomAnnotation';

class CrossAnnotation extends LuminCustomAnnotation {
  constructor() {
    super(CUSTOM_ANNOTATION.CROSS.name);
    this.Subject = CUSTOM_ANNOTATION.CROSS.subject;
    this.MaintainAspectRatio = true;
    this.ToolName = CUSTOM_ANNOTATION.CROSS.tool;
  }

  draw(ctx, pageMatrix) {
    const size = Math.max(Math.min(this.Width, this.Height), CUSTOM_ANNOTATION_MIN_SIZE);
    this.Width = size;
    this.Height = size;
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
    this.setStyles(ctx, pageMatrix);
    const padding = this.StrokeThickness / 3;
    ctx.beginPath();
    ctx.moveTo(0 + padding, 0 + padding);
    ctx.lineTo(this.Width - padding, this.Height - padding);
    ctx.moveTo(0 + padding, this.Height - padding);
    ctx.lineTo(this.Width - padding, 0 + padding);
    ctx.stroke();
  }
}

export default CrossAnnotation;
