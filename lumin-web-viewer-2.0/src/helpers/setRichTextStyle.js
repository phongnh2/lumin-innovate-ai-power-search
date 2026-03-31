import getRichTextCSSStyle from 'helpers/getRichTextCSSStyle';

export default (annotation) => {
  if (annotation instanceof window.Core.Annotations.FreeTextAnnotation) {
    const defaultStyle = annotation.getRichTextStyle()?.[0];
    const richTextStyle = getRichTextCSSStyle(annotation.getContents(), defaultStyle);
    if (richTextStyle) {
      annotation.setRichTextStyle(richTextStyle);
      annotation.IsModified = false;
    }
  }
};
