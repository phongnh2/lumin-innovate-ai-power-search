import Autolinker from 'autolinker';
import classNames from 'classnames';
import { escape as lodashEscape } from 'lodash';
import React, { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import core from 'core';

import { comment } from 'utils';
import { lazyWithRetry } from 'utils/lazyWithRetry';
import { ALPHA_REGEX, HTML_CONTENT } from 'utils/regex';

import CommentState from 'constants/commentState';
import { CUSTOM_DATA_COMMENT, CUSTOM_DATA_TEXT_TOOL } from 'constants/customDataConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { ModalTypes } from 'constants/lumin-common';

import { IUser } from 'interfaces/user/user.interface';

import { getRenderedMention } from '../utils';

const WarningHyperlinkContent = lazyWithRetry(() => import('lumin-components/WarningHyperlinkContent'));

const isComment = (annotation: Core.Annotations.Annotation) =>
  Boolean(annotation && annotation instanceof window.Core.Annotations.StickyAnnotation);

export const getText = (text: string, searchingContent: string): string => {
  if (searchingContent.trim()) {
    return text.replace(new RegExp(`(${searchingContent})`, 'gi'), '<span class="highlight">$1</span>');
  }
  if (text.includes('Anonymous')) {
    return text.split('-')[0];
  }
  return text;
};

export const useCommentContentState = ({
  annotation,
  currentUser,
  openViewerModal,
  closeViewerModal,
}: {
  annotation: Core.Annotations.StickyAnnotation;
  currentUser: IUser;
  openViewerModal?: (props: object) => void;
  closeViewerModal?: () => void;
}) => {
  const [content, setContent] = useState<ReactElement | string>(null);
  const isStickyAnnotation = annotation instanceof window.Core.Annotations.StickyAnnotation;
  const isReply = annotation.isReply();
  const noteState = isComment(annotation) ? annotation.getState() : '';
  const isAnnotationFreeText = annotation.Subject === AnnotationSubjectMapping.freetext;
  const { t } = useTranslation();
  const isReSolveOrReopen =
    isStickyAnnotation && isReply && [CommentState.Resolved.state, CommentState.Open.state].includes(noteState);

  const handleClickHyperlink = (event: React.MouseEvent<Element, MouseEvent>, isLink: boolean): void => {
    if (!isLink) {
      return;
    }
    const target = event.target as HTMLLinkElement;
    const url = target.href;
    const urlObject = new URL(url);
    const domain = urlObject.hostname.replace('www.', '');
    const subDomain = urlObject.hostname.split('.');
    const luminDomain = 'luminpdf.com';
    if (domain !== luminDomain && `${subDomain[1]}.${subDomain[2]}` !== luminDomain) {
      event.preventDefault();
      openViewerModal({
        type: ModalTypes.WARNING,
        title: t('viewer.noteContent.leavingLumin'),
        message: <WarningHyperlinkContent url={urlObject.href} />,
        cancelButtonTitle: t('common.cancel'),
        confirmButtonTitle: t('viewer.noteContent.proceed'),
        onCancel: () => closeViewerModal(),
        onConfirm: () => {
          window.open(urlObject.href, '_blank', 'noopener,noreferrer');
        },
        isFullWidthButton: true,
      });
    }
  };

  const getNoteContent = async (): Promise<ReactElement> => {
    const currentStyledComment = annotation.getCustomData(CUSTOM_DATA_COMMENT.STYLED_COMMENT.key);
    let currentContent =
      currentStyledComment || annotation.getContents() || annotation.getCustomData(CUSTOM_DATA_TEXT_TOOL.CONTENT.key);
    if (!currentContent) {
      return null;
    }

    if (isAnnotationFreeText) {
      currentContent = `<span>${lodashEscape(annotation.getContents())}</span>`;
    }

    let text = await getRenderedMention({
      annotation,
      text: currentContent,
      currentUser,
    });

    const isContentsLinkable = Autolinker.link(text).indexOf('<a') !== -1;

    if (isContentsLinkable) {
      const linkedContent = Autolinker.link(text, { stripPrefix: false });
      // if searchInput is 't', replace <a ...>text</a> with
      // <a ...><span class="highlight">t</span>ext</a>
      text = linkedContent.replace(HTML_CONTENT, (_, p1) => `>${getText(p1 as string, '')}<`);
    } else {
      text = getText(text, '');
    }
    const commentArray = comment.commentParser(text);
    return (
      <>
        {commentArray.map((cmt, index) => {
          const getStyleTag = comment.getHTMLTagsInString(cmt);
          const missedTag: string[] = [];

          if (getStyleTag.length) {
            getStyleTag.forEach((tag) => {
              const tagName = tag.replace(ALPHA_REGEX, '');
              const isCloseOpenTag = tag.search('/');
              const hasMoreThanOneSameTag = getStyleTag.filter((existTag) => existTag.includes(tagName)).length > 1;
              if (!hasMoreThanOneSameTag) {
                if (isCloseOpenTag >= 0) {
                  missedTag.push(`<${tagName}>`);
                  return;
                }
                missedTag.push(`</${tagName}>`);
              }
            });
          }
          const key = `${index}-${annotation.Id}`;
          const isLinkTag = cmt.startsWith('<a');
          const html = `${missedTag.join('')}${cmt}`;
          return (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label
            <span
              tabIndex={0}
              role="button"
              key={key}
              className={classNames({
                links: isLinkTag,
              })}
              onClick={(event) => handleClickHyperlink(event, isLinkTag)}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </>
    );
  };

  const updateContent = async (): Promise<void> => {
    let nodeContent = await getNoteContent();
    if (isReSolveOrReopen) {
      nodeContent = <p className="commentStatus">{nodeContent}</p>;
    }
    setContent(nodeContent);
  };

  const onAnnotationContentUpdate = async (annotationUpdated: Core.Annotations.Annotation[]): Promise<void> => {
    const isUpdatedComment = annotationUpdated?.[0] && annotation && annotationUpdated[0].Id === annotation.Id;
    if (isUpdatedComment) {
      await updateContent();
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    updateContent();
    core.addEventListener('annotationChanged', onAnnotationContentUpdate);

    return () => {
      core.removeEventListener('annotationChanged', onAnnotationContentUpdate);
    };
  }, [annotation.Id]);

  return {
    content,
    setContent,
  };
};
