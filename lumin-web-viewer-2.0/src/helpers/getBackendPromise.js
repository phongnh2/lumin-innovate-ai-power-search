import core from 'core';

export default (docType) => (docType === 'auto' || docType === 'wait'
  ? core.CoreControls.getDefaultBackendType()
  : Promise.resolve(docType));
