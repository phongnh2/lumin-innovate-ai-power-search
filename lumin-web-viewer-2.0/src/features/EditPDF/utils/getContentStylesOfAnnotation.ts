import core from 'core';

export type TextContentStyles = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontColor: string;
  fontSize: string;
  textAlign: string;
  fontName: string;
};

export const getContentStylesOfAnnotation = async (
  annotation: Core.Annotations.Annotation
): Promise<TextContentStyles> => {
  const contentBoxId = annotation.getCustomData('contentEditBoxId');
  return core.getContentEditManager().getContentBoxAttributes(contentBoxId) as Promise<TextContentStyles>;
};
