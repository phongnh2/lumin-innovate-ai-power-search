/// <reference path="./CommandHandler.d.ts" />
/* eslint-disable class-methods-use-this */
/* eslint-disable quotes */
import pLimit from 'p-limit';

import indexedDBService from 'services/indexedDBService';

import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { MANIPULATION_TYPE } from 'constants/lumin-common';

import Handler from './Handler';
import { getCommentOnlyInHandler, isCommentOnlyInHandler } from '../utils/commentChecker';

const annotsTagRegex = /<annots>(.*)<\/annots>/;
const fieldTagRegex = /<fields>(.*)<\/fields>/;
const concurrencyLimit = 1;
class CommandHandler extends Handler {
  constructor(mediator) {
    super(mediator);
    this.offlineTrackingEnabled = false;
    this.limitPromise = pLimit(concurrencyLimit);
  }

  set enabledOfflineTracking(enabled) {
    this.offlineTrackingEnabled = enabled;
  }

  getAllCommandsWithFormatted = async (documentId) => {
    const { annotations, manipulations, fields } = await indexedDBService.getAllCommands(documentId);
    const manipulationsFormatted = manipulations.map((manipStep) => {
      const formattedData = { ...manipStep };
      switch (manipStep.type) {
        case MANIPULATION_TYPE.ROTATE_PAGE: {
          const { option: { pageIndexes } } = manipStep;
          formattedData.option.pageIndexes = pageIndexes.map((page) => page.data);
          break;
        }
        case MANIPULATION_TYPE.CROP_PAGE: {
          const { option: { pageCrops } } = manipStep;
          formattedData.option.pageCrops = pageCrops.map((page) => page.data);
          break;
        }
        default: {
          break;
        }
      }

      return formattedData;
    }).filter(Boolean);

    const annotsFormatted = annotations.map(({ annotationId, xfdf }) => ({
      annotationId,
      xfdf,
    }));
    return { annotations: annotsFormatted, manipulations: manipulationsFormatted, fields };
  };

  getAllCommandWillBeSynced = async ({ documentId, newUnqAnnots }) => {
    const { annotations, manipulations, fields = [] } = await indexedDBService.getAllCommands(documentId);
    // eslint-disable-next-line sonarjs/no-identical-functions
    const manipulationsFormatted = manipulations.map((manipStep) => {
      const formattedData = { ...manipStep };
      switch (manipStep.type) {
        case MANIPULATION_TYPE.ROTATE_PAGE: {
          const { option: { pageIndexes } } = manipStep;
          formattedData.option.pageIndexes = pageIndexes.map(({ data: page, belongsTo }) => {
            const unqAnnot = newUnqAnnots.find((annot) => annot.Id === belongsTo);
            return unqAnnot ? unqAnnot.PageNumber : page;
          });
          break;
        }
        case MANIPULATION_TYPE.CROP_PAGE: {
          const { option: { pageCrops } } = manipStep;
          formattedData.option.pageCrops = pageCrops.map(({ data: page, belongsTo }) => {
            const unqAnnot = newUnqAnnots.find((annot) => annot.Id === belongsTo);
            return unqAnnot ? unqAnnot.PageNumber : page;
          });
          break;
        }
        default: {
          break;
        }
      }

      return formattedData;
    }).filter(Boolean);

    const annotFormatted = [];
    if (annotations.length) {
      annotations.forEach(({
        xfdf: storedXfdf, annotationAction, belongsTo, annotationId, ...rest
      }) => {
        const unqAnnot = newUnqAnnots.find((annot) => annot.Id === belongsTo);
        let xfdf = storedXfdf;
        if (unqAnnot) {
          xfdf = storedXfdf.replace(/page="\d"/, `page="${unqAnnot.PageNumber - 1}"`);
        }

        annotFormatted.push(
          {
            annotationAction: annotationAction === 'field' ? 'modify' : annotationAction,
            annotationId,
            xfdf,
            ...rest,
          },
        );
      });
    }
    return {
      annotations: annotFormatted,
      manipulations: manipulationsFormatted,
      fields,
    };
  };

  getRevertManipulationStep = async (documentId) => {
    const { manipulations } = await indexedDBService.getAllCommands(documentId);
    return manipulations.reverse().map((manipStep) => {
      const formattedData = { ...manipStep };
      switch (manipStep.type) {
        case MANIPULATION_TYPE.ROTATE_PAGE: {
          const { option: { pageIndexes } } = manipStep;
          formattedData.option.pageIndexes = pageIndexes.map((page) => page.data);
          formattedData.option.angle = -formattedData.option.angle;
          break;
        }
        case MANIPULATION_TYPE.CROP_PAGE: {
          const { option: { pageCrops } } = manipStep;
          formattedData.option.pageCrops = pageCrops.map((page) => page.data);
          formattedData.option.top = -formattedData.option.top;
          formattedData.option.bottom = -formattedData.option.bottom;
          formattedData.option.left = -formattedData.option.left;
          formattedData.option.right = -formattedData.option.right;
          break;
        }
        default: {
          break;
        }
      }

      return formattedData;
    }).filter(Boolean);
  };

  getAllTempAction = async (...args) => indexedDBService.getAllTempAction(...args);

  findCommandAndOverride = async (...args) => indexedDBService.findCommandAndOverride(...args);

  deleteAllCommands = async (documentId, { keepCommentAnnot } = {}) => {
    if (keepCommentAnnot) {
      const { annotations } = await indexedDBService.getAllCommands(documentId);
      const commentAnnots = getCommentOnlyInHandler(annotations);
      await indexedDBService.deleteAllCommands(documentId);
      return indexedDBService.insertAnnotation(documentId, { annots: commentAnnots });
    }
    return indexedDBService.deleteAllCommands(documentId);
  };

  insertAnnotation = async (documentId, { manager, annots }) => {
    const annotList = await Promise.all(annots.map(async ({
      annotationId, belongsTo, annotation, annotationAction, annotationType, ...rest
    }) => {
      let annotContent = '';
      switch (annotationAction) {
        case 'field':
          annotContent = annotation.replaceAll(/(\r\n|\n|\r)/gm, "").match(fieldTagRegex)?.pop() || '';
          break;
        case 'delete':
          annotContent = `<id page="${annotation.PageNumber}">${annotationId}</id>`;
          break;
        default:
          if (annotationType === AnnotationSubjectMapping.widget) {
            annotContent = annotation;
          } else {
            annotContent = (await manager.exportAnnotations({
              annotList: [annotation], fields: true, useDisplayAuthor: true,
            })).match(annotsTagRegex)?.pop() || '';
          }
          break;
      }
      return {
        annotationId,
        xfdf: annotContent,
        belongsTo,
        annotationAction,
        annotationType,
        annotationAuthor: annotation.Author,
        ...rest,
      };
    }));

    indexedDBService.insertAnnotation(documentId, { annots: annotList });
  };

  insertField = async (documentId, { name, value }) => {
    indexedDBService.insertField(documentId, { name, value });
  };

  getCommandStatus = async (documentId) => {
    const { annotations, manipulations } = await indexedDBService.getAllCommands(documentId);
    if (manipulations.length) {
      return {
        includedOfflineCommands: true,
        includedCommentOnly: false,
      };
    }

    return {
      includedOfflineCommands: annotations.length > 0,
      includedCommentOnly: isCommentOnlyInHandler(annotations),
    };
  };

  insertManipulation = (...args) => indexedDBService.insertManipulation(...args);

  insertTempAction = (...args) => {
    if (this.offlineTrackingEnabled) {
      this.limitPromise(() => indexedDBService.insertTempAction(...args));
    }
  };

  deleteTempAction = (...args) => indexedDBService.deleteTempAction(...args);
}

export default CommandHandler;
