import { CUSTOM_ANNOTATION, CUSTOM_ANNOTATION_MIN_SIZE } from 'constants/documentConstants';

import { LuminCustomAnnotation } from './LuminCustomAnnotation';

class StarAnnotation extends LuminCustomAnnotation {
  constructor() {
    super(CUSTOM_ANNOTATION.STAR.name);
    this.Subject = CUSTOM_ANNOTATION.STAR.subject;
    this.MaintainAspectRatio = true;
    this.ToolName = CUSTOM_ANNOTATION.STAR.tool;
  }

  draw(ctx, pageMatrix) {
    this.setStyles(ctx, pageMatrix);
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

    this.drawStar(ctx);
  }

  drawStar(ctx) {
    const padding = this.StrokeThickness * 2;
    const width = this.Width - padding;
    const height = this.Height - padding;
    ctx.translate(this.Width / 2, this.Height * 0.55);
    let rot = Math.PI / 2 * 3;
    let x = this.X;
    let y = this.Y;
    const step = Math.PI / 5;
    for (let i = 0; i < 5; i++) {
      x = Math.cos(rot) * width / 2;
      y = Math.sin(rot) * height / 2;
      ctx.lineTo(x, y);
      rot += step;

      x = Math.cos(rot) * width / 4;
      y = Math.sin(rot) * height / 4;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export default StarAnnotation;
