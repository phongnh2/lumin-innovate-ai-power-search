/* eslint-disable prefer-rest-params */
import isEqual from 'lodash/isEqual';
import React from 'react';
import { createRoot } from 'react-dom/client';

import actions from 'actions';
import core from 'core';

import setToolStyles from 'helpers/setToolStyles';

import string from 'utils/string';

import ChoiceWidgetSelect from 'features/DocumentFormBuild/components/ChoiceWidgetSelect/ChoiceWidgetSelect';

import DataElements from 'constants/dataElement';
import { FIELD_VALUE_MAX_LENGTH } from 'constants/formBuildTool';
import toolsName from 'constants/toolsName';

export const getLightBackgroundFormColor = () => getComputedStyle(document.body).getPropertyValue('--color-primary-60');

export default (store) => {
  const noFillColor = new window.Core.Annotations.Color(0, 0, 0, 0);
  const { dispatch } = store;
  setToolStyles(toolsName.CHECK_BOX, 'FillColor', noFillColor);
  setToolStyles(toolsName.RADIO, 'FillColor', noFillColor);
  core.getAnnotationManager().getFieldManager().disableWidgetHighlighting();

  const setWidgetDisabled = (widget) => {
    const canEdit =
      !core.isReadOnlyModeEnabled() &&
      core.canModify(widget) &&
      !widget.fieldFlags.get(window.Core.Annotations.WidgetFlags.READ_ONLY);
    const isInFormBuilderMode = core.getFormFieldCreationManager().isInFormFieldCreationMode();
    widget.innerElement.disabled = !canEdit;
    widget.innerElement.style.pointerEvents = !canEdit || isInFormBuilderMode ? 'none' : 'auto';
  };
  window.Core.Annotations.WidgetAnnotation.prototype.styledInnerElement = function () {
    if (!this.innerElement) {
      return;
    }
    if (
      isEqual(noFillColor, this.backgroundColor) &&
      !this.innerElement.className.includes('NoColorWidgetPlaceholder')
    ) {
      this.innerElement.classList.add('NoColorWidgetPlaceholder');
    }

    if (
      !isEqual(noFillColor, this.backgroundColor) &&
      this.innerElement.className.includes('NoColorWidgetPlaceholder')
    ) {
      this.innerElement.classList.remove('NoColorWidgetPlaceholder');
    }

    setWidgetDisabled(this);
    const customTabIndex = this.getCustomData('tabindex');
    if (customTabIndex) {
      this.innerElement.tabIndex = parseInt(customTabIndex);
    }
  };

  window.Core.Annotations.SignatureWidgetAnnotation.prototype.styledInnerElement = function () {
    if (this.innerElement) {
      const hasNoFillColor = this.innerElement.className.includes('NoColorWidgetPlaceholder');
      const hasAssociatedSignature = this.getAssociatedSignatureAnnotation();
      if (hasNoFillColor && hasAssociatedSignature) {
        this.innerElement.classList.remove('NoColorWidgetPlaceholder');
      }
      if (!hasNoFillColor && !hasAssociatedSignature) {
        this.innerElement.classList.add('NoColorWidgetPlaceholder');
      }
      setWidgetDisabled(this);
    }
  };
  const originalRadioRefresh = window.Core.Annotations.RadioButtonWidgetAnnotation.prototype.refresh;
  window.Core.Annotations.RadioButtonWidgetAnnotation.prototype.refresh = function () {
    originalRadioRefresh.call(this, ...arguments);
    if (!this.element) {
      return;
    }
    this.element.style.borderRadius = '50%';
    this.innerElement.style.borderRadius = '50%';
    const svgElement = this.innerElement.firstChild;
    if (svgElement) {
      svgElement.style.width = '100%';
      svgElement.style.height = '100%';
    }
  };

  const originalWidgetAnnotationRefresh = window.Core.Annotations.WidgetAnnotation.prototype.refresh;
  window.Core.Annotations.WidgetAnnotation.prototype.refresh = function () {
    originalWidgetAnnotationRefresh.call(this, ...arguments);
    this.styledInnerElement();
  };

  const originalWidgetAnnotationRender = window.Core.Annotations.WidgetAnnotation.prototype.render;
  window.Core.Annotations.WidgetAnnotation.prototype.render = function () {
    originalWidgetAnnotationRender.call(this, ...arguments);
    this.styledInnerElement();
  };

  window.Core.Annotations.TextWidgetAnnotation.prototype.styledRender = function () {
    if (this.element) {
      const innerFieldInput = this.element.querySelector('input') || this.element.querySelector('textarea');
      if (!innerFieldInput) {
        return;
      }
      innerFieldInput.maxLength = FIELD_VALUE_MAX_LENGTH;
      const { width, height } = innerFieldInput.style;
      const { borderWidth } = this.element.style;
      this.element.style.width = `${string.pixelUnitToNumber(width) + (string.pixelUnitToNumber(borderWidth) * 2)}px`;
      this.element.style.height = `${string.pixelUnitToNumber(height) + (string.pixelUnitToNumber(borderWidth) * 2)}px`;

      const customTabIndex = this.getCustomData('tabindex');
      if (customTabIndex) {
        this.innerElement.tabIndex = parseInt(customTabIndex);
      }
    }
  };

  const originalTextWidgetRefresh = window.Core.Annotations.TextWidgetAnnotation.prototype.refresh;
  window.Core.Annotations.TextWidgetAnnotation.prototype.refresh = function () {
    originalTextWidgetRefresh.call(this, ...arguments);
    this.styledRender();
  };

  const originalTextWidgetRender = window.Core.Annotations.TextWidgetAnnotation.prototype.render;
  window.Core.Annotations.TextWidgetAnnotation.prototype.render = function () {
    const blackColor = new window.Core.Annotations.Color(0, 0, 0, 1);
    if (isEqual(this.backgroundColor, blackColor)) {
      const whiteColor = new window.Core.Annotations.Color(255, 255, 255, 1);
      this.backgroundColor = whiteColor;
    }
    originalTextWidgetRender.call(this, ...arguments);
    this.styledRender();
  };

  const originalCheckButtonWidgetRefresh = window.Core.Annotations.CheckButtonWidgetAnnotation.prototype.refresh;
  window.Core.Annotations.CheckButtonWidgetAnnotation.prototype.refresh = function () {
    originalCheckButtonWidgetRefresh.call(this, ...arguments);
  };

  const originalTextWidgetCreateInner = window.Core.Annotations.TextWidgetAnnotation.prototype.createInnerElement;
  window.Core.Annotations.TextWidgetAnnotation.prototype.createInnerElement = function () {
    this.fieldFlags.set(window.Core.Annotations.WidgetFlags.DO_NOT_SCROLL, false); // allow to scroll inside multiline text field
    return originalTextWidgetCreateInner.call(this, ...arguments);
  };

  window.Core.Annotations.ChoiceWidgetAnnotation.prototype.createInnerElement = function () {
    if (!this.root) {
      this.root = createRoot(this.element);
    }
    this.root.render(<ChoiceWidgetSelect annotation={this} />);
  };

  window.Core.Tools.FormFieldCreateTool.prototype.getPreviewElement = function () {
    return Object.values(this).find((value) => value instanceof HTMLElement && value.id === 'previewElement');
  };

  const originFormFieldCreateToolMouseMove = window.Core.Tools.FormFieldCreateTool.prototype.mouseMove;
  window.Core.Tools.FormFieldCreateTool.prototype.mouseMove = function() {
    originFormFieldCreateToolMouseMove.call(this, ...arguments);
    const noFillColor = new window.Core.Annotations.Color(0, 0, 0, 0);
    const color = this.defaults.FillColor;
    const isTransparentColor = isEqual(noFillColor, color);
    const previewElement = this.getPreviewElement();
    if (isTransparentColor && previewElement) {
      previewElement.style.backgroundColor = getLightBackgroundFormColor();
    }
  };

  const originTextFormFieldCreateToolMouseLeftDown = window.Core.Tools.FormFieldCreateTool.prototype.mouseLeftDown;
  window.Core.Tools.FormFieldCreateTool.prototype.mouseLeftDown = function () {
    dispatch({ type: 'CLOSE_ELEMENT', payload: { dataElement: DataElements.FORM_BUILD_TOOLTIP } });
    originTextFormFieldCreateToolMouseLeftDown.call(this, ...arguments);
  };

  const originTextFormFieldCreateToolMouseLeftUp = window.Core.Tools.FormFieldCreateTool.prototype.mouseLeftUp;
  window.Core.Tools.FormFieldCreateTool.prototype.mouseLeftUp = function () {
    dispatch(actions.openElement(DataElements.FORM_BUILD_TOOLTIP));
    originTextFormFieldCreateToolMouseLeftUp.call(this, ...arguments);
  };

  const originalFormFieldCreationManagerSetFieldName = window.Core.FormFieldCreationManager.prototype.setFieldName;
  window.Core.FormFieldCreationManager.prototype.setFieldName = function (annotation, fieldName) {
    const regex = /^\.|\.$/;
    if (regex.test(fieldName.trim())) {
      return { isValid: false, errorType: 'invalidFieldName' };
    }
    return originalFormFieldCreationManagerSetFieldName.call(this, ...arguments);
  };

  // Need to directly customize minified function of setAssociatedSignatureAnnotation
  const originalSignatureWidgetSetAssociateSignture =
    window.Core.Annotations.SignatureWidgetAnnotation.prototype[
      window.Core.Annotations.SignatureWidgetAnnotation.prototype.setAssociatedSignatureAnnotation.name
    ];
    window.Core.Annotations.SignatureWidgetAnnotation.prototype[
      window.Core.Annotations.SignatureWidgetAnnotation.prototype.setAssociatedSignatureAnnotation.name
    ] = function () {
    const isReadOnly = this.fieldFlags.get(window.Core.Annotations.WidgetFlags.READ_ONLY);
    if (isReadOnly) {
      this.fieldFlags.set(window.Core.Annotations.WidgetFlags.READ_ONLY, false);
    }
    originalSignatureWidgetSetAssociateSignture.call(this, ...arguments);
    if (isReadOnly) {
      this.fieldFlags.set(window.Core.Annotations.WidgetFlags.READ_ONLY, true);
    }
  };
};
