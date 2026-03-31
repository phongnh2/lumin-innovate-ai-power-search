import { FormFieldDetection } from 'features/FormFieldDetection/constants/detectionField.constant';
import { FormFieldDetectionType } from 'features/FormFieldDetection/types/detectionField.type';

import { CUSTOM_ANNOTATION } from 'constants/documentConstants';

export default class DetectedFieldPlaceholder extends window.Core.Annotations.CustomAnnotation {
  public CustomIsHoveringPlaceholder = false;

  public CustomFieldType: FormFieldDetectionType = FormFieldDetection.TEXT_BOX;

  public CustomFieldId = '';

  constructor() {
    super(CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.name);

    this.Subject = CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject;
    this.MaintainAspectRatio = true;
    this.ToolName = CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.tool;
    this.FillColor = new window.Core.Annotations.Color(196, 240, 253, 0);
    this.StrokeColor = new window.Core.Annotations.Color(255, 255, 255, 0);
    this.NoMove = true;
    this.NoResize = true;
    this.Listable = false;
    this.IsHoverable = false;
    this.disableRotationControl();
  }

  draw(ctx: CanvasRenderingContext2D, pageMatrix: unknown) {
    this.FillColor = new window.Core.Annotations.Color(196, 240, 253, this.CustomIsHoveringPlaceholder ? 1 : 0);
    this.setStyles(ctx, pageMatrix);
    ctx.translate(this.X, this.Y);
    ctx.fillRect(0, 0, this.Width, this.Height);
  }

  // eslint-disable-next-line class-methods-use-this
  serialize(): Element {
    return null;
  }
}
