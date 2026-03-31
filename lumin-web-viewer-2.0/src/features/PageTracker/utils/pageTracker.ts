import fireEvent from 'helpers/fireEvent';

import { CollabManipChangedParams, ManipChangedParams } from 'features/PageTracker/types/pageTracker.type';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { MANIPULATION_TYPE } from 'constants/lumin-common';

import { PageManipulation } from './pageManipulation';

export class PageTracker {
  private pageMapper: Map<number, number> = new Map();

  private onManipulationChangedHandler: (data: ManipChangedParams) => void;

  constructor({ onManipulationChangedHandler }: { onManipulationChangedHandler: (data: ManipChangedParams) => void }) {
    this.onManipulationChangedHandler = onManipulationChangedHandler;
  }

  public trackPage(page: number) {
    this.pageMapper.set(page, page);
  }

  public untrackPage(page: number) {
    this.pageMapper.delete(page);
  }

  public getMappedPage(page: number) {
    return this.pageMapper.get(page);
  }

  public updatePageMapper(page: number, mappedPage: number) {
    if (!this.pageMapper.has(page)) {
      return;
    }

    this.pageMapper.set(page, mappedPage);
  }

  public onManipulationChanged(data: ManipChangedParams) {
    const { type, manipulationPages, movedOriginPage, mergedPagesCount } = data;
    const manipPageMapper = PageManipulation.MANIPULATION_HANDLERS[type]({
      originalPages: Array.from(this.pageMapper.values()),
      manipulationData: {
        manipulationPages,
        movedOriginPage,
        mergedPagesCount,
      },
    });
    const updatedPageMapper = new Map<number, number>();
    this.pageMapper.forEach((value, key) => {
      if (manipPageMapper.has(value)) {
        updatedPageMapper.set(key, manipPageMapper.get(value));
      } else {
        updatedPageMapper.set(key, value);
      }
    });
    this.pageMapper = new Map(updatedPageMapper);
    this.onManipulationChangedHandler?.(data);
  }

  public onCollabManipChanged(manipData: CollabManipChangedParams) {
    if (manipData.type === MANIPULATION_TYPE.MERGE_PAGE) {
      return;
    }

    const {
      type,
      option: { insertBeforePage, pagesToMove, pagesRemove = [], insertPages = [] },
      id: manipulationId,
    } = manipData;
    const data: ManipChangedParams = {
      type,
      manipulationPages: null,
      manipulationId,
    };
    switch (type) {
      case MANIPULATION_TYPE.MOVE_PAGE: {
        if (Number.isFinite(pagesToMove)) {
          data.movedOriginPage = pagesToMove;
          data.manipulationPages = [insertBeforePage];
        }
        break;
      }
      case MANIPULATION_TYPE.REMOVE_PAGE: {
        data.manipulationPages = pagesRemove;
        break;
      }
      case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
        data.manipulationPages = insertPages;
        break;
      }
      default:
        break;
    }

    this.onManipulationChangedHandler?.(data);
  }

  static updateOnManipulationChanged(data: ManipChangedParams) {
    fireEvent(CUSTOM_EVENT.PAGE_TRACKER_MANIPULATION_CHANGED, data);
  }

  static updateOnCollabManipChanged(data: CollabManipChangedParams) {
    fireEvent(CUSTOM_EVENT.PAGE_TRACKER_COLLAB_MANIP_CHANGED, data);
  }

  get getPageMapper() {
    return this.pageMapper;
  }
}
