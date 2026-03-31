import core from 'core';

import { commandHandler } from 'HOC/OfflineStorageHOC';

import CommentState from 'constants/commentState';
import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { socket } from '../../socket';

export const makeXfdfString = (annoString) => `<?xml version="1.0" encoding="UTF-8" ?>
<xfdf xmlns="http://www.w3.org/1999/xhtml" xml:space="preserve"><fields /><add /><modify>${annoString}</modify><delete /></xfdf>`;

export const getAnnotationFromXfdf = async (annot) => new Promise(async (resolve) => {
  const parser = new DOMParser();
  const xfdfSelected = await core.getAnnotationManager().exportAnnotations({
    annotList: annot,
    widgets: false,
    links: false,
    fields: false,
  });
  resolve(parser.parseFromString(xfdfSelected, 'text/xml').querySelector('annots').children);
});

export const toggleDisplayNote = (isResolved, withHighlightAnno) => {
  const annotManager = core.getAnnotationManager();
  isResolved ? annotManager.hideAnnotation(withHighlightAnno) : annotManager.showAnnotation(withHighlightAnno);
};

const emitChangeAnnotation = ({
  annotationId,
  xfdf,
  currentDocument,
  currentUser,
  annotationType,
  pageIndex,
  annotationAction,
}) => {
  socket.emit(SOCKET_EMIT.ANNOTATION_CHANGE, {
    roomId: currentDocument._id,
    xfdf,
    annotationId,
    userId: currentUser._id,
    email: currentUser.email,
    annotationType,
    pageIndex,
    annotationAction,
  });
};

export const emitModifyParentNote = async (
    isResolved,
    annotation,
    withHighlightAnno,
    currentDocument,
    currentUser,
    isOffline
  ) =>
  new Promise(async (resolve) => {
    const annoManager = core.getAnnotationManager();
    const [commentAnno, highlightAnno] = await getAnnotationFromXfdf(
      withHighlightAnno ? [annotation, withHighlightAnno] : [annotation]
    );

    const xmlSerializer = new XMLSerializer();
    let highlightAnnoString = '';
    commentAnno.setAttribute('state', isResolved ? CommentState.Resolved.state : CommentState.Open.state);
    if (!withHighlightAnno) {
      const stickyFlags = commentAnno.getAttribute('flags')?.split(',') ?? [];
      if (isResolved) {
        stickyFlags.push('noview');
      } else if (stickyFlags.indexOf('noview') > -1) {
        stickyFlags.splice(stickyFlags.indexOf('noview'), 1);
      }
      commentAnno.setAttribute('flags', stickyFlags.join(','));
    } else {
      const highlightFlags = highlightAnno.getAttribute('flags')?.split(',') ?? [];
      if (isResolved) {
        highlightFlags.push('hidden');
      } else if (highlightFlags.indexOf('hidden') > -1) {
        highlightFlags.splice(highlightFlags.indexOf('hidden'), 1);
      }
      highlightAnno.setAttribute('flags', highlightFlags.join(','));
      highlightAnnoString = xmlSerializer.serializeToString(highlightAnno);
    }

    const commentAnnoString = xmlSerializer.serializeToString(commentAnno);
    const xfdf = makeXfdfString(commentAnnoString + highlightAnnoString);
    const _xfdf = makeXfdfString(highlightAnnoString);
    emitChangeAnnotation({
      annotationId: annotation.Id,
      xfdf,
      currentDocument,
      currentUser,
      annotationType: annotation.Subject,
      pageIndex: annotation.PageNumber,
      annotationAction: ANNOTATION_ACTION.MODIFY,
    });
    annoManager.importAnnotationCommand(xfdf);

    isResolved && core.deselectAnnotation(annotation);
    if (!isResolved) {
      core.selectAnnotation(annotation);
      core.jumpToAnnotation(annotation);
    }

    if (isOffline) {
      await commandHandler.findCommandAndOverride({
        documentId: currentDocument._id,
        annotationId: annotation.Id,
        overrideObj: { xfdf }
      });
      await commandHandler.findCommandAndOverride({
        documentId: currentDocument._id,
        annotationId: withHighlightAnno.Id,
        overrideObj: { xfdf: _xfdf }
      });
    } else {
      await commandHandler.insertTempAction(currentDocument._id, [
        {
          type: 'annotation',
          xfdf,
        },
      ]);
    }

    resolve();
  });
