import { useDispatch, useSelector } from 'react-redux';

import { LayoutElements } from '@new-ui/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import { updateAnnotationAvatarSource } from 'features/Annotation/utils/updateAnnotationAvatarSource';

import { CUSTOM_EVENT } from 'constants/customEvent';

export const useAddFirstComment = () => {
  const currentPage = useSelector(selectors.getCurrentPage);
  const currentUser = useSelector(selectors.getCurrentUser);
  const dispatch = useDispatch();

  const selectComment = (commentId: string): void => {
    dispatch(actions.setSelectedComment(commentId));
  };

  const setNotEditing = (): void => {
    dispatch(actions.triggerNoteEditing());
  };

  const closeCommentHistory = (): void => {
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.DEFAULT,
      isOpen: false,
    });
  };

  return (): Promise<void> | void => {
    const annotationManager = core.getAnnotationManager();
    const defaultStickyColor = new window.Core.Annotations.Color(3, 89, 112, 1);
    const stickyAnnotation = new window.Core.Annotations.StickyAnnotation();
    const pageSize = core.getPageInfo(currentPage);
    const pageRotation = core.getCompleteRotation(currentPage) * 90;
    const averageAnnotationSize = stickyAnnotation.Width / 2;
    const isPageLandscape = pageRotation === 90 || pageRotation === 270;
    const X = (isPageLandscape ? pageSize.height : pageSize.width) / 2 - averageAnnotationSize;
    const Y = (isPageLandscape ? pageSize.width : pageSize.height) / 2 - averageAnnotationSize;

    closeCommentHistory();

    stickyAnnotation.Rotation = pageRotation;
    stickyAnnotation.PageNumber = currentPage;
    stickyAnnotation.setX(X);
    stickyAnnotation.setY(Y);
    stickyAnnotation.Author = core.getCurrentUser();
    stickyAnnotation.StrokeColor = defaultStickyColor;
    updateAnnotationAvatarSource({
      annotation: stickyAnnotation,
      currentUser,
    });
    annotationManager.drawAnnotationsFromList([stickyAnnotation]).catch((err) => logger.logError({ error: err }));
    annotationManager.addAnnotation(stickyAnnotation);

    if (!core.isContinuousDisplayMode()) {
      core.setDisplayMode(core.CoreControls.DisplayModes.Continuous);
      core.jumpToAnnotation(stickyAnnotation);
    }
    selectComment(stickyAnnotation.Id);
    core.selectAnnotation(stickyAnnotation);
    setNotEditing();
  };
};
