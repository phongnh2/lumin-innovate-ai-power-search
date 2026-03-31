import React from 'react';

import Divider from '@new-ui/general-components/Divider';

import MeasureTool from 'features/MeasureTool/components/MeasureTool';

import PasswordSettingMenu from './PasswordSettingMenu';
import * as Tool from '../tools-components';
import RedactionTool from '../tools-components/RedactionTool';

export type ToolType = {
  key: string;
  order: number;
  element: React.ReactNode;
};

export const PopularTools: ToolType[] = [
  { order: 0, key: 'eraser', element: <Tool.EraserTool /> },
  { order: 1, key: 'shape', element: <Tool.ShapeTool /> },
  { order: 2, key: 'highlight', element: <Tool.HighlightTool /> },
  { order: 3, key: 'free_hand', element: <Tool.FreeHandTool /> },
  { order: 4, key: 'free_text', element: <Tool.FreeTextTool /> },
  { order: null, key: 'divider', element: <Divider orientation="vertical" /> },
  { order: 5, key: 'signature', element: <Tool.SignatureTool /> },
  { order: null, key: 'divider', element: <Divider orientation="vertical" /> },
  { order: 6, key: 'comment', element: <Tool.CommentTool /> },
  { order: 7, key: 'sign_send', element: <Tool.SignAndSendBtn /> },
];

export const AnnotationTools: ToolType[] = [
  { order: 0, key: 'image', element: <Tool.ImageTool /> },
  { order: 1, key: 'eraser', element: <Tool.EraserTool /> },
  { order: 2, key: 'shape', element: <Tool.ShapeTool /> },
  { order: 3, key: 'text', element: <Tool.TextTool /> },
  { order: 4, key: 'highlight', element: <Tool.HighlightTool /> },
  { order: 5, key: 'free_hand', element: <Tool.FreeHandTool /> },
  { order: 6, key: 'free_text', element: <Tool.FreeTextTool /> },
  { order: null, key: 'divider', element: <Divider orientation="vertical" /> },
  { order: 7, key: 'measure', element: <MeasureTool /> },
  { order: null, key: 'divider', element: <Divider orientation="vertical" /> },
  { order: 8, key: 'comment', element: <Tool.CommentTool /> },
];

export const FillAndSignTools = [
  { order: 0, key: 'form_builder', element: <Tool.FormBuilderToolContainer /> },
  { order: null, key: 'divider', element: <Divider orientation="vertical" /> },
  { order: 1, key: 'cross_stamp', element: <Tool.CrossStampTool /> },
  { order: 2, key: 'tick_stamp', element: <Tool.TickStampTool /> },
  { order: 3, key: 'dot_stamp', element: <Tool.DotStampTool /> },
  { order: 4, key: 'rubber_stamp', element: <Tool.RubberStampTool /> },
  { order: 5, key: 'date_stamp', element: <Tool.DateStampTool /> },
  { order: 6, key: 'free_text', element: <Tool.FreeTextTool /> },
  { order: 7, key: 'signature', element: <Tool.SignatureTool /> },
  { order: 8, key: 'sign_send', element: <Tool.SignAndSendBtn /> },
];

export const SecurityTools: ToolType[] = [
  { order: 0, key: 'redaction', element: <RedactionTool /> },
  { order: 1, key: 'password', element: <PasswordSettingMenu /> },
];

export const getPageTools = (withEditPermission: () => void): ToolType[] => [
  { order: 0, key: 'ocr', element: <Tool.OcrTool withEditPermission={withEditPermission} /> },
  { order: 1, key: 'crop', element: <Tool.CropTool withEditPermission={withEditPermission} /> },
  { order: 2, key: 'insert', element: <Tool.InsertTool withEditPermission={withEditPermission} /> },
  { order: 3, key: 'move', element: <Tool.MovePageTool withEditPermission={withEditPermission} /> },
  { order: 4, key: 'delete', element: <Tool.DeleteTool withEditPermission={withEditPermission} /> },
  { order: 5, key: 'rotate', element: <Tool.RotateTool withEditPermission={withEditPermission} /> },
  { order: 6, key: 'split', element: <Tool.SplitTool withEditPermission={withEditPermission} /> },
  { order: 7, key: 'merge', element: <Tool.MergeTool withEditPermission={withEditPermission} /> },
];
