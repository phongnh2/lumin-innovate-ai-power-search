export abstract class AnnotationCommandBase {
  static signedUrlsMap: Record<string, string> = {};

  static updateSignedUrlsMap(signedUrlsMap: Record<string, string>) {
    AnnotationCommandBase.signedUrlsMap = signedUrlsMap;
  }

  constructor(protected annotationId: string) {};

  abstract execute(annotsElement: Element): void;
}