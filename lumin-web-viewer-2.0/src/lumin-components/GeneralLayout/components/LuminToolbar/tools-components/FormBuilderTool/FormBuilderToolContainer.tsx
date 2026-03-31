import React, { useContext } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { useEnabledFormFieldDetection } from 'features/FormFieldDetection/hooks/useEnabledFormFieldDetection';

import { FORM_BUILDER_TOOL_ITEM } from './constants';
import FormBuilderTool from './FormBuilderTool';
import FormBuilderToolOriginal from './FormBuilderToolOriginal';
import { ToolbarItemContext } from '../../components/ToolbarItem';

interface FormBuilderToolContainerProps {
  specificTool?: FORM_BUILDER_TOOL_ITEM;
}

const FormBuilderToolContainer = ({ specificTool }: FormBuilderToolContainerProps) => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isOffline = useSelector(selectors.isOffline);
  const { enabledFormFieldDetection } = useEnabledFormFieldDetection();

  const { renderAsMenuItem } = useContext(ToolbarItemContext);

  const isLocalFile = currentDocument?.isSystemFile;

  const showFormFieldDetectionMenuItem = enabledFormFieldDetection && !isLocalFile && !isOffline;

  if (showFormFieldDetectionMenuItem || renderAsMenuItem) {
    return (
      <FormBuilderTool showFormFieldDetectionMenuItem={showFormFieldDetectionMenuItem} specificTool={specificTool} />
    );
  }

  return <FormBuilderToolOriginal />;
};

export default FormBuilderToolContainer;
