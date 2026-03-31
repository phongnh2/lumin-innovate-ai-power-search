import core from 'core';

import { setCustomAnnotationSerializer } from 'helpers/customAnnotationSerializer';

import { removeMeasurementAppearance } from 'features/MeasureTool/utils/removeMeasurementAppearance';

import { configureDuplicateIdPrevention } from './configureDuplicateIdPrevention';

export default async function exportAnnotations(...args) {
  setCustomAnnotationSerializer();

  /**
   * Handle duplicate annotation IDs by overriding the 'name' attribute in XFDF
   * during serialization, avoiding direct setter which causes errors.
   */
  configureDuplicateIdPrevention();

  const xfdf = await core.exportAnnotations(...args);
  window.Core.Annotations.restoreSerialize(window.Core.Annotations.Annotation);
  window.Core.Annotations.restoreSerialize(window.Core.Annotations.StampAnnotation);
  /* TEMPORARY FIX FOR LMV-4844 */
  window.Core.Annotations.restoreSerialize(window.Core.Annotations.FreeTextAnnotation);
  /* END */

  removeMeasurementAppearance();
  return xfdf;
}
