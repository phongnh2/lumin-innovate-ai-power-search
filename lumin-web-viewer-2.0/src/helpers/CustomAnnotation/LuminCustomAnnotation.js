export class LuminCustomAnnotation extends window.Core.Annotations.CustomAnnotation {
  constructor(name) {
    super(name);
    this.MaintainAspectRatio = true;
  }

  convertToBase64(matrix) {
    const rotationAngle = window.Core.Annotations.RotationUtils.getRotationAngleInRadiansByDegrees(this.Rotation);
    const unrotatedBoundingBox = window.Core.Annotations.RotationUtils.getUnrotatedDimensionsFromRectangularAnnotations(
      this.getRect(),
      rotationAngle
    );
    const transformationBuilder = new window.Core.Math.TransformationBuilder();
    const canvasMultipler = window.Core.getCanvasMultiplier();
    const middleHorizontal = unrotatedBoundingBox.x + unrotatedBoundingBox.width / 2;
    const middleVertical = unrotatedBoundingBox.y + unrotatedBoundingBox.height / 2;
    const canvas = document.createElement('canvas');
    const ouputImagePadding = window.Core.Annotations.CustomAnnotation.OutputImagePadding || 0;
    canvas.width = (unrotatedBoundingBox.width + ouputImagePadding) * canvasMultipler;
    canvas.height = (unrotatedBoundingBox.height + ouputImagePadding) * canvasMultipler;
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    const contextTransform = transformationBuilder
      .translateTo(middleHorizontal, middleVertical, 0, 0)
      .rotate(rotationAngle, true)
      .scale(canvasMultipler, canvasMultipler)
      .translateTo(0, 0, canvas.width / 2, canvas.height / 2)
      .getFinalTransform()
      .toTransform();
    context.setTransform(...contextTransform);
    const opacity = this.Opacity;
    this.draw(context, matrix);
    this.Opacity = opacity;
    return canvas.toDataURL();
  }

  serialize(originalElement, pageMatrix) {
    const element = super.serialize(originalElement, pageMatrix);
    const dataUrl = this.convertToBase64(pageMatrix);
    if (!dataUrl) {
      return element;
    }
    const imageDataElement = element.querySelector('imagedata');
    imageDataElement.textContent = dataUrl.replaceAll('%0A', '');
    return element;
  }

  deserialize(element, pageMatrix, options) {
    super.deserialize(element, pageMatrix, options);
    this.Rotation = Number(this.Rotation);
  }
}