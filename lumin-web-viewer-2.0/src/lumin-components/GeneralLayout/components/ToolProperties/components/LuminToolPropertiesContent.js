import React from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import DocumentRevision from 'luminComponents/DocumentRevision';

import DocumentVersioningProvider from 'features/DocumentRevision/components/DocumentVersioningProvider';
import EditPDFProvider from 'features/EditPDF/components/EditPDFProvider';

import CropPanel from './CropPanel';
import DeletePanel from './DeletePanel';
import EditPdfPanel from './EditPdfPanel';
import FormBuilder from './FormBuilder';
import InsertPanel from './InsertPanel';
import MeasureToolPanel from './MeasureToolPanel/MeasureToolPanel';
import MergePanel from './MergePanel';
import MovePanel from './MovePanel';
import PanelHeader from './PanelHeader';
import RotatePanel from './RotatePanel';
import SplitExtractPanel from './SplitExtractPanel';
import { TOOL_PROPERTIES_VALUE } from '../../LuminLeftPanel/constants';

const LuminToolPropertiesContent = () => {
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue);
  const isDocumentRevision = toolPropertiesValue === TOOL_PROPERTIES_VALUE.REVISION;

  const renderContent = (toolPropertiesValue) => {
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.MERGE) {
      return <MergePanel />;
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.ROTATE) {
      return <RotatePanel />;
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.INSERT) {
      return <InsertPanel />;
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.SPLIT_EXTRACT) {
      return <SplitExtractPanel />;
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.MOVE) {
      return <MovePanel />;
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.DELETE) {
      return <DeletePanel />;
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.CROP) {
      return <CropPanel />;
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.EDIT_PDF) {
      return (
        <EditPDFProvider>
          <EditPdfPanel />
        </EditPDFProvider>
      );
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.FORM_BUILD) {
      return <FormBuilder />;
    }

    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.MEASURE) {
      return <MeasureToolPanel />;
    }

    if (isDocumentRevision) {
      return (
        <DocumentVersioningProvider>
          <DocumentRevision />
        </DocumentVersioningProvider>
      );
    }

    return null;
  };
  return (
    <>
      {!isDocumentRevision && <PanelHeader />}
      {renderContent(toolPropertiesValue)}
    </>
  );
};

export default LuminToolPropertiesContent;
