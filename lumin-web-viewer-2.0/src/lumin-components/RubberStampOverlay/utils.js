import core from 'core';

import { generateSubtitle } from 'luminComponents/RubberStampModal/utils';

import TOOLS_NAME from 'constants/toolsName';

import { DEFAULT_RUBBER_STAMPS, RUBBER_STAMPS_EVENT_ELEMENT_NAME, RUBBER_STAMP_FOLDER_DEFAULT } from './constants';

const getDefaultStampSrc = (src) => `${window.location.origin}/${RUBBER_STAMP_FOLDER_DEFAULT}/${src}.png`;

export const getRubberStampProperty = (property) => {
  const subtitle = property.subtitle || generateSubtitle(property.author, property.dateFormat, property.timeFormat);
  return { ...property, subtitle };
};

export const showRubberStampPreview = async (data, callback = (f) => f) => {
  callback();
  core.setToolMode(TOOLS_NAME.RUBBER_STAMP);
  const rubberStampTool = core.getTool(TOOLS_NAME.RUBBER_STAMP);
  rubberStampTool.addCustomStamp(data);
  const rubberStampAnnotation = await rubberStampTool.createCustomStampAnnotation(data);
  await rubberStampTool.setRubberStamp(rubberStampAnnotation);
  rubberStampTool.showPreview();
};

export const getDefaultRubberStamps = async () => {
  const rubberStampTool = core.getTool(TOOLS_NAME.RUBBER_STAMP);

  rubberStampTool.setStandardStamps(DEFAULT_RUBBER_STAMPS.map(({ src }) => getDefaultStampSrc(src)));

  const annotations = await rubberStampTool.getStandardStampAnnotations();

  return annotations.map((annotation, index) => ({
    annotation,
    imgSrc: getDefaultStampSrc(DEFAULT_RUBBER_STAMPS[index].src),
    name: DEFAULT_RUBBER_STAMPS[index].name,
    elementName: RUBBER_STAMPS_EVENT_ELEMENT_NAME[DEFAULT_RUBBER_STAMPS[index].src],
  }));
};
