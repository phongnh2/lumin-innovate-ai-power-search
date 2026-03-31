/* eslint-disable max-classes-per-file */
import core from 'core';

import { PageCanvas } from './pageCanvas';

export class PresentationManager {
  private pages: Map<number, PageCanvas>;

  private pageUsageOrder: number[];

  private readonly totalPages: number;

  private static readonly MAX_CACHED_PAGES = 50;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.pages = new Map();
    this.pageUsageOrder = [];
    this.totalPages = core.getTotalPages();
  }

  private isValidPage(page: number): boolean {
    return page > 0 && page <= this.totalPages;
  }

  private updatePageUsage(page: number): void {
    // Remove the page from its current position if it exists
    this.pageUsageOrder = this.pageUsageOrder.filter((p) => p !== page);
    // Add it to the front as most recently used
    this.pageUsageOrder.unshift(page);

    // If we exceed the limit, remove least recently used pages
    while (this.pages.size > PresentationManager.MAX_CACHED_PAGES) {
      const lruPage = this.pageUsageOrder.pop();
      if (lruPage !== undefined) {
        const pageCanvas = this.pages.get(lruPage);
        if (pageCanvas) {
          pageCanvas.cancelLoading();
          this.pages.delete(lruPage);
        }
      }
    }
  }

  private getOrCreatePageCanvas(page: number): PageCanvas | null {
    if (!this.isValidPage(page)) {
      return null;
    }

    let pageCanvas = this.pages.get(page);
    if (!pageCanvas) {
      pageCanvas = new PageCanvas(page);
      this.pages.set(page, pageCanvas);
    }
    this.updatePageUsage(page);
    return pageCanvas;
  }

  private calculatePagesToPreload(currentPage: number): number[] {
    // Preload 2 pages before and after, but ensure they're valid
    return [-2, -1, 1, 2].map((offset) => currentPage + offset).filter((page) => this.isValidPage(page));
  }

  public preload(page: number): void {
    if (!this.isValidPage(page)) {
      return;
    }

    this.calculatePagesToPreload(page).forEach((pageNum) => {
      const pageCanvas = this.getOrCreatePageCanvas(pageNum);
      if (pageCanvas && !pageCanvas.isAvailableToDraw()) {
        pageCanvas.preload();
      }
    });
  }

  public render(page: number): void {
    if (!this.isValidPage(page)) {
      return;
    }

    const pageCanvas = this.getOrCreatePageCanvas(page);
    if (!pageCanvas) {
      return;
    }

    if (pageCanvas.isAvailableToDraw()) {
      pageCanvas.renderCachedContent(this.canvas);
    } else {
      pageCanvas.loadData(this.canvas, () => {
        this.preload(page);
      });
    }
  }

  public cancelLoading(page: number): void {
    if (!this.isValidPage(page)) {
      return;
    }

    const pageCanvas = this.pages.get(page);
    if (pageCanvas) {
      pageCanvas.cancelLoading();
    }
  }

  public cleanup(): void {
    // Cancel any pending loads and clear references
    this.pages.forEach((pageCanvas) => pageCanvas.cancelLoading());
    this.pages.clear();
    this.pageUsageOrder = [];
  }

  public clearPageCache(page: number): void {
    if (!this.isValidPage(page)) {
      return;
    }

    const pageCanvas = this.pages.get(page);
    if (pageCanvas) {
      pageCanvas.cancelLoading();
      this.pages.delete(page);
      this.pageUsageOrder = this.pageUsageOrder.filter((p) => p !== page);
    }
  }
}
