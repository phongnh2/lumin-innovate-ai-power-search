import core from 'core';

import defaultTool from 'constants/defaultTool';

export default () => (annotation) => {
  core.selectAnnotation(annotation);
  core.setToolMode(defaultTool);
};