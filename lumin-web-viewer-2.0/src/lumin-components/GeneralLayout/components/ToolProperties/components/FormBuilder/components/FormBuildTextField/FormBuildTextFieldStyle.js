import React, { useState } from 'react';

import Collapse from 'lumin-components/GeneralLayout/general-components/Collapse';
import FrameStylePalette from 'luminComponents/GeneralLayout/general-components/FrameStylePalette';

import { useTranslation } from 'hooks';

import getAnnotationStyles from 'helpers/getAnnotationStyles';
import setToolStyles from 'helpers/setToolStyles';

import TextStyle from './TextStyle';
import { useFormBuilderContext } from '../../formBuilderContext';

const FormBuildTextFieldStyle = () => {
  const { t } = useTranslation();

  const { formFieldAnnotation, handleStyleChange } = useFormBuilderContext();
  const [initialStyle, setInitialStyle] = useState(getAnnotationStyles(formFieldAnnotation));

  const onTextFieldStyleChange = (property, value, option = { withoutInitValueChange: true }) => {
    setToolStyles(formFieldAnnotation.ToolName, property, value);

    if (option.withoutInitValueChange) {
      setInitialStyle({
        ...initialStyle,
        [property]: value,
      });
    }
    handleStyleChange(property, value);
  };

  return (
    <Collapse title={t('viewer.formBuildPanel.style')}>
      <TextStyle onChange={onTextFieldStyleChange} style={initialStyle} />

      <FrameStylePalette
        title={t('generalLayout.toolProperties.textFrame')}
        style={initialStyle}
        onChange={onTextFieldStyleChange}
      />
    </Collapse>
  );
};

export default FormBuildTextFieldStyle;
