import { Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance, isAxiosError } from 'axios';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { User } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';

import { CannyApiRoutes } from '../constants/canny-route.constants';
import { ICannyComment } from '../interfaces/canny-comment.interface';
import { ICannyCreatePostResponse, ICannyPost } from '../interfaces/canny-post.interface';
import { ICannyCreateUserResponse } from '../interfaces/canny-user.interface';
import { sanitizeErrorLog } from '../utils';

@Injectable()
export class CannyService {
  private cannyInstance: AxiosInstance;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly environmentService: EnvironmentService,
  ) {
    this.cannyInstance = axios.create({
      baseURL: `${this.environmentService.getByKey(EnvConstants.CANNY_BASE_URL)}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        apiKey: this.environmentService.getByKey(EnvConstants.CANNY_API_KEY),
      },
    });
  }

  addPostTag({ postId, tagId }: {postId: string, tagId: string}) {
    return this.cannyInstance.post(CannyApiRoutes.AddPostTag, {
      postID: postId,
      tagID: tagId,
    });
  }

  getScoreTagIds() {
    const tagIds = JSON.parse(this.environmentService.getByKey(EnvConstants.CANNY_FEEDBACK_SCORE_TAGS));
    if (tagIds.length !== 5) {
      throw new Error('Score tags must have 5 elements');
    }
    return tagIds;
  }

  getFormFieldFeedbackCategoryId() {
    return this.environmentService.getByKey(EnvConstants.CANNY_FORM_FIELDS_CATEGORY_ID);
  }

  getDocumentManagementCategoryId() {
    return this.environmentService.getByKey(EnvConstants.CANNY_DOCUMENT_MANAGEMENT_CATEGORY_ID);
  }

  getMobileCategoryId() {
    return this.environmentService.getByKey(EnvConstants.CANNY_MOBILE_FEEDBACK_CATEGORY_ID);
  }

  getMobileTagId() {
    return this.environmentService.getByKey(EnvConstants.CANNY_MOBILE_FEEDBACK_TAG_ID);
  }

  async retrieveUserByEmail(email: string) {
    try {
      const response = await this.cannyInstance.post(CannyApiRoutes.RetrieveUser, {
        email,
      });
      return response.data;
    } catch (err) {
      if (err instanceof AxiosError && err.response.data.error === 'invalid email') {
        return null;
      }
      throw err;
    }
  }

  async getPostsByBoardId({
    boardId,
    tagIds,
  }: {
    boardId: string
    tagIds: string[],
  }): Promise<ICannyPost[]> {
    try {
      const response = await this.cannyInstance.post<{
        posts: ICannyPost[]
      }>(CannyApiRoutes.RetrievePosts, {
        boardID: boardId,
        tagIDs: tagIds,
      });

      return response.data.posts;
    } catch (error) {
      this.loggerService.error({
        context: 'getCannyPostsByBoardId',
        error: sanitizeErrorLog(error),
        extraInfo: {
          boardId,
        },
      });
      return null;
    }
  }

  async getPostById(id: string): Promise<ICannyPost> {
    try {
      const respone = await this.cannyInstance.post<ICannyPost>(CannyApiRoutes.RetrievePost, {
        id,
      });
      return respone.data;
    } catch (error) {
      this.loggerService.error({
        context: 'getCannyPostById',
        error: sanitizeErrorLog(error),
        extraInfo: {
          id,
        },
      });
      return null;
    }
  }

  async createComment({
    postId,
    content,
    authorId,
    internal = false,
  }: {
    postId: string;
    content: string;
    authorId: string;
    internal?: boolean;
  }): Promise<ICannyComment> {
    const response = await this.cannyInstance.post<ICannyComment>(CannyApiRoutes.CreateComment, {
      authorID: authorId,
      postID: postId,
      value: content,
      internal,
    });

    return response.data;
  }

  /**
   * @link https://developers.canny.io/api-reference#create_post
   */
  async createPost({
    content, boardId, authorId, categoryId, title, imageURLs,
  }: {
    content: string;
    boardId: string;
    authorId?: string;
    categoryId?: string;
    title?: string;
    imageURLs?: string[];

  }) {
    try {
      const response = await this.cannyInstance.post<ICannyCreatePostResponse>(CannyApiRoutes.CreatePost, {
        boardID: boardId,
        details: content,
        authorID: authorId,
        categoryID: categoryId,
        title,
        imageURLs,
      });
      return response.data;
    } catch (err) {
      if (isAxiosError<{ error: string }>(err)) {
        throw new Error(err.response.data.error);
      }
      throw err;
    }
  }

  async createMobilePost({
    content, boardId, categoryId, title, imageURLs, user,
  }: {
    content: string;
    boardId: string;
    categoryId?: string;
    title: string;
    imageURLs?: string[];
    user: User;
  }) {
    try {
      let userCanny = await this.retrieveUserByEmail(user.email);
      if (!userCanny) {
        const userPayload = {
          name: user.name,
          email: user.email,
          userID: user._id,
        };
        const res = await this.cannyInstance.post<ICannyCreateUserResponse>(CannyApiRoutes.CreateOrUpdateUser, userPayload);
        userCanny = res.data;
      }
      if (!userCanny?.id) {
        this.loggerService.debug('createMobilePost', {
          extraInfo: {
            userCanny,
          },
        });
      }
      const response = await this.createPost({
        content,
        boardId,
        authorId: userCanny?.id,
        categoryId,
        title,
        imageURLs,
      });
      return response;
    } catch (err) {
      if (isAxiosError<{ error: string }>(err)) {
        throw new Error(err.response.data.error);
      }
      throw err;
    }
  }
}
