import { images } from 'constants/documentType';

export class IconStampCreateTool extends window.Core.Tools.SignatureCreateTool {
  imageData: string;

  iconName: string;

  annotationSubject: string;

  clearPreviewSignatureElement() {
    Object.entries(this).forEach(([key, value]: [string, unknown]) => {
      const isDivEl = value instanceof HTMLDivElement;
      if (isDivEl && value.id === 'signature-preview') {
        value.remove();
        (this as Record<string, unknown>)[key] = null;
      }
    });
  }

  setImageData(imageData: string) {
    this.imageData = imageData;
  }

  setIconName(iconName: string) {
    this.iconName = iconName;
  }

  setAnnotationSubject(annotationSubject: string) {
    this.annotationSubject = annotationSubject;
  }

  async addIconStamp() {
    await this.addSignature();
    this.hidePreview();
    this.clearPreviewSignatureElement();
  }

  constructor(docViewer: Core.DocumentViewer) {
    super(docViewer);
    this.setDefaultSignatureOptions({
      maximumDimensionSize: 18,
    });
  }

  getIconFilePath() {
    return `${window.location.origin}/assets/images/${this.iconName}.png`;
  }

  async setIconStamp() {
    await this.setSignature(this.imageData ?? this.getIconFilePath());
    const annot = this.getFullSignatureAnnotation() as Core.Annotations.StampAnnotation & { image: HTMLImageElement };
    if (!this.imageData) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const { image } = annot;
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      const base64Data = canvas.toDataURL(images.PNG);
      this.setImageData(base64Data);
      await annot.setImageData(base64Data);
    }
    annot.Subject = this.annotationSubject;
    annot.ToolName = this.name;
  }

  async setAnnotImageData(annot: Core.Annotations.StampAnnotation) {
    if (this.iconName) {
      await annot.setImageData(this.getIconFilePath());
    }
  }
}
