import React from 'react';

import EditPdfColor from 'lumin-components/GeneralLayout/components/ToolProperties/components/EditPdfPanel/components/EditPdfColor';
import EditPdfPopOver from 'lumin-components/GeneralLayout/components/ToolProperties/components/EditPdfPanel/components/EditPdfPopover';
import EditPdfStyle from 'lumin-components/GeneralLayout/components/ToolProperties/components/EditPdfPanel/components/EditPdfStyle';

import { useEditPDFContext } from 'features/EditPDF/hooks/useEditPDFContext';

import { DataElements } from 'constants/dataElement';

const EditPdfPanel = () => {
  const {
    format,
    selectionMode,
    textEditProperties,
    handleFontStyleChange,
    handleTextFormatChange,
    handleColorChange,
  } = useEditPDFContext();

  return (
    <div data-element={DataElements.CONTENT_EDIT_PANEL}>
      <EditPdfStyle
        freeTextMode={selectionMode === 'FreeText'}
        textEditProperties={textEditProperties}
        disabled={!selectionMode}
        onFontStyleChange={handleFontStyleChange}
        onTextFormatChange={handleTextFormatChange}
        format={format}
      />
      <EditPdfColor disabled={!selectionMode} handleColorChange={handleColorChange} format={format} />
      <EditPdfPopOver />
    </div>
  );
};

EditPdfPanel.defaultProps = {};

export default EditPdfPanel;
