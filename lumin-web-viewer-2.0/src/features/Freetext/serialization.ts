/* eslint-disable @typescript-eslint/unbound-method */
import { TOOLS_NAME } from 'constants/toolsName';

import { fontNameRegex, boldItalicRegex, toPascalCase } from './regex';
import {
  getTransformedFontName,
  convertRGBToNormalized,
  createDefaultAppearance,
  createDefaultStyle,
  collectFontTokens,
} from './utils';

// Main serialization override
export function configFreetextSerialization() {
  const originalSerialize = window.Core.Annotations.FreeTextAnnotation.prototype.serialize;

  const originalDeserialize = window.Core.Annotations.FreeTextAnnotation.prototype.deserialize;

  window.Core.Annotations.FreeTextAnnotation.prototype.serialize = function (element: Element, _pageMatrix: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, prefer-rest-params
    element = originalSerialize.call(this, element, _pageMatrix);
    const richtextStyle = this.getRichTextStyle()?.[0] ?? {};
    const normalizedColor = convertRGBToNormalized(this.StrokeColor);
    const hexColor = this.TextColor.toHexString();

    const defaultAppearance = createDefaultAppearance(
      normalizedColor,
      getTransformedFontName({
        fontName: this.Font,
        fontStyle: richtextStyle,
        toPascal: true,
      }),
      this.FontSize
    );
    const defaultStyle = createDefaultStyle({
      fontName: getTransformedFontName({
        fontName: this.Font,
        fontStyle: richtextStyle,
        toPascal: false,
      }),
      fontSize: this.FontSize,
      textAlign: this.TextAlign,
      hexColor,
    });

    element.querySelector('defaultappearance').textContent = defaultAppearance;
    element.querySelector('defaultstyle').textContent = defaultStyle;

    // Store originals using untransformed font name
    this.originalDefaultAppearance = createDefaultAppearance(normalizedColor, toPascalCase(this.Font), this.FontSize);
    this.originalDefaultStyle = createDefaultStyle({
      fontName: this.Font,
      fontSize: this.FontSize,
      textAlign: this.TextAlign,
      hexColor,
    });

    return element;
  };

  window.Core.Annotations.FreeTextAnnotation.prototype.deserialize = function (element: Element, pageMatrix: unknown) {
    const defaultStyle = element.querySelector('defaultstyle') || document.createElement('defaultstyle');
    const defaultAppearance = element.querySelector('defaultappearance') || document.createElement('defaultappearance');

    if (!defaultStyle.textContent) {
      const styleContent = document.createTextNode('font: Inter 9pt; text-align: left; color: #E44234');
      defaultStyle.appendChild(styleContent);
      element.appendChild(defaultStyle);
    } else {
      for (const stringArray = defaultStyle.textContent.split(';'); stringArray.length > 0; ) {
        const text = stringArray.pop();
        const match = fontNameRegex.exec(text);
        if (match) {
          const fontName = match[1] || match[2];
          if (!boldItalicRegex.test(fontName)) {
            break;
          }
          const transformedName = fontName.replace(boldItalicRegex, '');
          const transformedContent = defaultStyle.textContent.replace(fontName, transformedName);
          defaultStyle.innerHTML = transformedContent;
          break;
        }
      }
    }

    if (!defaultAppearance.textContent) {
      const appearanceContent = document.createTextNode('0 0 0 rg /Inter 9 Tf');
      defaultAppearance.appendChild(appearanceContent);
      element.appendChild(defaultAppearance);
    } else {
      for (const stringArray = defaultAppearance.textContent.split(' '); stringArray.length > 0; ) {
        const text = stringArray.pop();
        if (text === 'Tf') {
          // Remove font size token
          stringArray.pop();
          const fontName = collectFontTokens(stringArray).reverse().join(' ');
          const transformedName = fontName.replace(boldItalicRegex, '');
          const transformedContent = defaultAppearance.textContent.replace(fontName, transformedName);
          defaultAppearance.innerHTML = transformedContent;
          break;
        }
      }
    }
    // eslint-disable-next-line prefer-rest-params
    originalDeserialize.call(this, element, pageMatrix);
    if (this.getDateFormat()) {
      this.ToolName = TOOLS_NAME.DATE_FREE_TEXT;
    }
    const richtextStyle = this.getRichTextStyle();
    if (richtextStyle) {
      Object.entries(richtextStyle).forEach(([position, styleObject]) => {

        const transformedStyle: Record<string, string> = {};
        Object.entries(styleObject).forEach(([key, value]) => {
          transformedStyle[key.trim()] = value.trim();
        });
        richtextStyle[position] = transformedStyle;
      });
    }
    this.setRichTextStyle(richtextStyle);
  };
}
