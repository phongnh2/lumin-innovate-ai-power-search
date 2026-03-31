import core from 'core';

import exportAnnotations from 'helpers/exportAnnotations';

export function decreasePageNumberXfdf(xfdf: string): string {
  const maxPage = core.getTotalPages();
  const mapObjAnnot: Record<string, string> = {};
  for (let index = 0; index < maxPage; index++) {
    const key = `page="${index + 1}"`;
    const value = `page="${index}"`;
    mapObjAnnot[key] = value;
  }
  const re = new RegExp(Object.keys(mapObjAnnot).join('|'), 'gi');
  return xfdf.replace(re, (matched: string) => mapObjAnnot[matched]);
}

export function increasePageNumberXfdf(xfdf: string): string {
  const maxPage = core.getTotalPages();
  const mapObjAnnot: Record<string, string> = {};
  for (let index = 0; index < maxPage; index++) {
    const key = `page="${index}"`;
    const value = `page="${index + 1}"`;
    mapObjAnnot[key] = value;
  }
  const re = new RegExp(Object.keys(mapObjAnnot).join('|'), 'gi');
  return xfdf.replace(re, (matched: string) => mapObjAnnot[matched]);
}

export const getWidgetXfdf = async (isSaveToDb: boolean): Promise<string> => {
  /*
    TEMPORARY FIX ISSUE: when passing annotList argument to exportAnnotations, it won't export fields data.
    Solution will be export xfdf of all annotations and widgets, then we remove all annotations from the xfdf string before saving it to the database.
    This function will be deprecated once LMV-2092 release.
    */
  let xfdf = await exportAnnotations();
  const parser = new DOMParser();
  const xfdfElements = parser.parseFromString(xfdf, 'text/xml');
  const annotsElements = xfdfElements.querySelector('annots');
  if (annotsElements) {
    annotsElements.outerHTML = '';
  }

  xfdf = new XMLSerializer().serializeToString(xfdfElements);
  /*
    END
  */
  if (isSaveToDb) {
    xfdf = decreasePageNumberXfdf(xfdf);
  }
  return xfdf;
};

export default {
  decreasePageNumberXfdf,
  increasePageNumberXfdf,
  getWidgetXfdf,
};
