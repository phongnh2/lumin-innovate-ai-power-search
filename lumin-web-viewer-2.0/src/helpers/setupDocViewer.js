import core from 'core';

import CrossCreateTool from 'helpers/CustomAnnotation/CrossCreateTool';
import StarCreateTool from 'helpers/CustomAnnotation/StarCreateTool';
import TickCreateTool from 'helpers/CustomAnnotation/TickCreateTool';

import { getFormatDateStampByLanguage } from 'utils/date';

import { CrossStampCreateTool } from 'features/CustomRubberStamp/tool/CrossStampCreateTool';
import { DotStampCreateTool } from 'features/CustomRubberStamp/tool/DotStampCreateTool';
import { TickStampCreateTool } from 'features/CustomRubberStamp/tool/TickStampCreateTool';

import { AnnotationSubjectMapping } from 'constants/documentConstants';

const FREEHAND_CREATE_DELAY_TIME = 100;

const addToolsToDocViewer = (docViewer) => {
  const toolModeMap = core.getToolModeMap();

  toolModeMap.AnnotationCreateSignature = new window.Core.Tools.SignatureCreateTool(docViewer);
  toolModeMap.AnnotationCreateStar = new StarCreateTool(docViewer);
  toolModeMap.AnnotationCreateCross = new CrossCreateTool(docViewer);
  toolModeMap.AnnotationCreateTick = new TickCreateTool(docViewer);

  toolModeMap.AnnotationCreateDotStamp = new DotStampCreateTool(docViewer);
  toolModeMap.AnnotationCreateCrossStamp = new CrossStampCreateTool(docViewer);
  toolModeMap.AnnotationCreateTickStamp = new TickStampCreateTool(docViewer);

  toolModeMap.AnnotationCreatePolygon.enableCreationOverAnnotation();

  toolModeMap.AnnotationCreatePolygonCloud.enableCreationOverAnnotation();

  toolModeMap.AnnotationCreatePolyline.enableCreationOverAnnotation();

  toolModeMap.AnnotationCreateDateFreeText.setDateFormat(getFormatDateStampByLanguage());

  toolModeMap.AnnotationCreateFreeHandHighlight.setCreateDelay(FREEHAND_CREATE_DELAY_TIME);

  toolModeMap.AnnotationCreateFreeHand.setCreateDelay(FREEHAND_CREATE_DELAY_TIME);

  window.Core.Annotations.Utilities.setAnnotationSubjectHandler((type) => AnnotationSubjectMapping[type]);

  toolModeMap.AnnotationCreateSignature.setSigningMode(window.Core.Tools.SignatureCreateTool.SigningModes.ANNOTATION);
};

const setupDocViewer = () => {
  const { docViewer } = core;

  // at 100% zoom level, adjust this whenever zoom/fitmode is updated
  docViewer.DEFAULT_MARGIN = 10;
  addToolsToDocViewer(docViewer);
};
export default setupDocViewer;
