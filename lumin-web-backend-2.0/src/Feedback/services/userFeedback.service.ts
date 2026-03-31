import { Injectable } from '@nestjs/common';
import { isAxiosError } from 'axios';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { sanitizeErrorLog } from 'Feedback/utils';
import {
  CreateShareDocFeedbackInput, ReasonTag, User,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';

import { CannyService } from './canny.service';
import { DEFAULT_COMMENT_CONTENT } from '../constants/layout-feedback.constant';

@Injectable()
export class UserFeedbackService {
  constructor(
    private readonly cannyService: CannyService,
    private readonly environmentService: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {}

  private getDefaultAuthorId() {
    return this.environmentService.getByKey(EnvConstants.CANNY_AUTHOR_ID);
  }

  private getLayoutFeedbackBoardId() {
    return this.environmentService.getByKey(EnvConstants.CANNY_LAYOUT_FEEDBACK_BOARD_ID);
  }

  private getFeatureRequestFeedbackBoardId() {
    return this.environmentService.getByKey(EnvConstants.CANNY_MOBILE_FEEDBACK_BOARD_ID);
  }

  private async createPost({
    content,
    authorId,
    tagIds,
    categoryId,
    title,
  }: {
    title: string,
    content: string,
    authorId: string,
    tagIds: string[],
    categoryId: string,
  }) {
    try {
      const post = await this.cannyService.createPost({
        boardId: this.getLayoutFeedbackBoardId(),
        title,
        content,
        authorId,
        categoryId,
      });
      await this.cannyService.addPostTag({
        postId: post.id,
        tagId: tagIds[0],
      });

      return post;
    } catch (err) {
      if (isAxiosError<{error: string}>(err)) {
        throw new Error(err.response?.data.error);
      }
      throw err;
    }
  }

  getTagIdByScore(score: number) {
    try {
      const tagIds = this.cannyService.getScoreTagIds();
      return tagIds[score - 1];
    } catch (error) {
      this.loggerService.error({
        context: 'getScoreTagId',
        error: sanitizeErrorLog(error),
      });
      return null;
    }
  }

  async createFormFieldsFeedback({ content, tagIds, userEmail }: {
    content: string,
    tagIds: string[],
    userEmail: string,
  }) {
    let authorId = this.getDefaultAuthorId();
    const user = await this.cannyService.retrieveUserByEmail(userEmail);
    if (user) {
      authorId = user.id;
    }
    const post = await this.createPost({
      title: 'Form Field Detection Feedback',
      content,
      authorId,
      tagIds,
      categoryId: this.cannyService.getFormFieldFeedbackCategoryId(),
    });
    return post;
  }

  async createShareDocFeedback({
    reasonTag,
    specificFeedback,
  }: CreateShareDocFeedbackInput) {
    const authorId = this.getDefaultAuthorId();

    const specificFeedbackTagId = this.environmentService.getByKey(EnvConstants.CANNY_SPECIFIC_FEEDBACK_POST_ID);

    const mapReasonTagNameToCategory = {
      [ReasonTag.UnreliableStorage]: this.environmentService.getByKey(EnvConstants.CANNY_UNRELIABLE_STORAGE_POST_ID),
      [ReasonTag.ConfusingUX]: this.environmentService.getByKey(EnvConstants.CANNY_CONFUSING_UX_POST_ID),
      [ReasonTag.NoDemand]: this.environmentService.getByKey(EnvConstants.CANNY_NO_DEMAND_POST_ID),
      [ReasonTag.SpecificFeedback]: specificFeedbackTagId,
    };

    const createCommentPromise = [];

    if (reasonTag && reasonTag !== ReasonTag.SpecificFeedback) {
      const reasonCommentPromise = this.cannyService.createComment({
        postId: mapReasonTagNameToCategory[reasonTag],
        content: `[ANONYMOUS-USER] - ${DEFAULT_COMMENT_CONTENT}`,
        authorId,
      });
      createCommentPromise.push(reasonCommentPromise);
    }

    if (specificFeedback || reasonTag === ReasonTag.SpecificFeedback) {
      const specificCommentPromise = this.cannyService.createComment({
        postId: specificFeedbackTagId,
        content: `[ANONYMOUS-USER] - ${specificFeedback || DEFAULT_COMMENT_CONTENT}`,
        authorId,
      });
      createCommentPromise.push(specificCommentPromise);
    }

    await Promise.all(createCommentPromise).catch((err) => {
      this.loggerService.error({
        context: 'createShareDocFeedback',
        error: sanitizeErrorLog(err),
      });
    });
  }

  async createMobileFeedback({
    content, title, imageURLs, user,
  }: {
    content: string; title?: string; imageURLs?: string[]; user: User;
  }) {
    try {
      const boardId = this.getFeatureRequestFeedbackBoardId();
      const categoryId = this.cannyService.getMobileCategoryId();
      let tmpContent = content;
      let comment = '';
      const splitContent = content.split(/\[(.*?)\]/).filter((item) => item !== '' && item !== ' ');
      if (splitContent.length > 2 && (splitContent[0] === 'Android app' || splitContent[0] === 'iOS app')) {
        comment = `[${splitContent[0]}][${splitContent[1]}]`;
        tmpContent = tmpContent.replace(comment, '');
      }
      const post = await this.cannyService.createMobilePost({
        boardId,
        categoryId,
        content: tmpContent,
        title,
        imageURLs,
        user,
      });
      if (post.id) {
        const mobileTag = this.cannyService.getMobileTagId();
        if (mobileTag) {
          await this.cannyService.addPostTag({
            postId: post.id,
            tagId: mobileTag,
          });
        }
        if (comment) {
          await this.cannyService.createComment({
            postId: post.id,
            content: comment,
            authorId: this.getDefaultAuthorId(),
            internal: true,
          });
        }
      }
      return post;
    } catch (error) {
      this.loggerService.error({
        context: 'createMobileFeedback',
        error: sanitizeErrorLog(error),
      });
      throw error;
    }
  }
}
