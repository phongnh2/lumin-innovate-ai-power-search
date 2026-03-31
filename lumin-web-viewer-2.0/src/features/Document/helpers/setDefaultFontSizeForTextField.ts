import core from 'core';

import { WIDGET_TYPE } from 'constants/formBuildTool';

export default function setDefaultFontSizeForTextField() {
  core.getFieldsList().forEach((field) => {
    if (field.type === WIDGET_TYPE.TEXT && field.widgets.length) {
      const { font } = field;
      const widget = field.widgets[0];
      const fitFontSize = Math.round(widget.Height / 1.5);
      const isMultiline = field.flags.get(window.Core.Annotations.WidgetFlags.MULTILINE);
      const defaultFontSize = (isMultiline && fitFontSize > 12) ? 12 : fitFontSize;
      if (!font) {
        field.set({
          font: new window.Core.Annotations.Font({ name: 'Inter', size: defaultFontSize }),
        });
      }
      if (!font.size) {
        font.set({ size: defaultFontSize });
      }
      if (!font.name) {
        font.set({ name: 'Inter', type: 'TrueType' });
        field.widgets.forEach((textWidget) => {
          textWidget.font.set({ name: 'Inter', type: 'TrueType' });
        });
      }
    }
  });
  core.getAnnotationsList().forEach((annot) => {
    if (annot instanceof window.Core.Annotations.TextWidgetAnnotation && !annot.appearance) {
      annot.set({ appearances: {} } as Core.Annotations.WidgetAnnotation);
    }
  });
}