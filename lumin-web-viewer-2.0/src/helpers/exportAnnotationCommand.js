import core from 'core';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { ANNOTATION_ACTION } from 'constants/documentConstants';

export default (annotation, action) => {
  let xfdf = '';
  if (action !== ANNOTATION_ACTION.DELETE && annotation) {
    let element = document.createElementNS("", annotation.elementName);
    const pageMatrix = core.getDocument().getPageMatrix(annotation.PageNumber).inverse();
    element = annotation.serialize(element, pageMatrix);
    const serializer = new XMLSerializer();
    xfdf = serializer.serializeToString(element);
  }
  switch (action) {
    case ANNOTATION_ACTION.ADD: {
      return `<?xml version="1.0" encoding="UTF-8" ?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n<fields />\n<add>${xfdf}</add>\n<modify />\n<delete />\n</xfdf>`;
    }
    case ANNOTATION_ACTION.MODIFY: {
      return `<?xml version="1.0" encoding="UTF-8" ?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n<fields />\n<add />\n<modify>${xfdf}</modify>\n<delete />\n</xfdf>`;
    }
    case ANNOTATION_ACTION.DELETE: {
      const widgetId = annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
      const widget = widgetId && core.getAnnotationManager().getAnnotationById(widgetId);
      const fieldNameAttr = widget ? ` pdftronSignatureFieldName="${widget.fieldName}"` : '';
      return `<?xml version="1.0" encoding="UTF-8" ?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n<fields />\n<add />\n<modify />\n<delete><id page="${
        annotation.PageNumber - 1
      }"${fieldNameAttr}>${annotation.Id}</id>\n</delete>\n</xfdf>`;
    }
    default:
      throw Error;
  }

};