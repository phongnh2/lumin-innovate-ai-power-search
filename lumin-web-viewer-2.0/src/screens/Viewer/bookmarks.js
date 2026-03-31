/* eslint-disable no-constructor-return */
import isEmpty from 'lodash/isEmpty';
import { createRoot } from 'react-dom/client';
import v4 from 'uuid/v4';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { cachingFileHandler, systemFileHandler } from 'HOC/OfflineStorageHOC';

import documentGraphServices from 'services/graphServices/documentGraphServices';

import fireEvent from 'helpers/fireEvent';

import { textExtractor, toastUtils } from 'utils';

import { DEFAULT_BOOKMARK_TITLE } from 'constants/documentConstants';
import { MANIPULATION_TYPE } from 'constants/lumin-common';

import { store } from '../../redux/store';

const { getState, dispatch } = store;

const createSection = (docIns, doc, page) =>
  new Promise(async (resolve) => {
    const pageIns = await doc.getPage(page);
    const sectionList = await textExtractor.getAllSectionOfPage(docIns, pageIns, page);

    const sections = [];
    sectionList.forEach((section) => {
      const subSections = [];
      section.children.forEach((subSection) => {
        const subBookmark = new core.CoreControls.Bookmark([], subSection.title, page, null, subSection.vertical, 0);
        subSections.push(subBookmark);
      });
      const bookmark = new core.CoreControls.Bookmark(subSections, section.title, page, null, section.vertical, 0);
      sections.push(bookmark);
    });
    resolve(sections);
  });

const createBookmark = (docIns, doc, page, message) =>
  new Promise(async (resolve) => {
    const children = await createSection(docIns, doc, page);
    const result = new core.CoreControls.Bookmark(children, message, page, null, 0, 0);
    resolve(result);
  });

export default class Bookmarks {
  constructor(t) {
    if (Bookmarks.instance) {
      // eslint-disable-next-line no-constructor-return
      return Bookmarks.instance;
    }

    Bookmarks.instance = this;
    this._bookmarks = {};
    this._prevBookmarks = null;
    this._updatedBookmarks = {};
    this._activeIndex = null;
    this._currentDocument = null;
    this._currentUser = null;
    this._undoBookmark = {};
    this._subcriptionObserver = null;
    this._isInOfflineMode = false;
    this.t = t;
    this.rootElements = {};
    // eslint-disable-next-line no-constructor-return
    return this;
  }

  setData = (bookmarkMessage, page) => {
    const data = {
      message: bookmarkMessage,
      id: v4(),
    };
    this._bookmarks[page] = data;
  };

  initOnlineBookmark({ bookmark, currentUser, page }) {
    if (Array.isArray(bookmark)) {
      // NOTE: new format
      const found = bookmark.find(({ email }) => email === currentUser.email);
      if (found) {
        const bookmarkMessage = found.message.trim() || this.t(DEFAULT_BOOKMARK_TITLE);
        this.setData(bookmarkMessage, page);
      }
    } else if (bookmark[currentUser.email]) {
      // NOTE: old format
      const bookmarkMessage = bookmark[currentUser.email].trim() || DEFAULT_BOOKMARK_TITLE;
      this.setData(bookmarkMessage, page);
    }
  }

  initialBookmarks(document, currentUser) {
    this._currentDocument = document;
    this._currentUser = currentUser;
    if (!currentUser) {
      return;
    }
    if (!document.bookmarks) {
      this._subcriptionObserver =
        !this._currentDocument.isSystemFile && this.subcriptionUpdateBookmark(currentUser._id, document._id);
      return;
    }
    const bookmarks = JSON.parse(document.bookmarks);

    bookmarks.forEach((item) => {
      const { bookmark, page } = item;
      if (this._currentDocument.isSystemFile) {
        if (bookmark[currentUser.email]) {
          const bookmarkMessage = bookmark[currentUser.email].trim() || DEFAULT_BOOKMARK_TITLE;
          this.setData(bookmarkMessage, page);
        }
      } else {
        this.initOnlineBookmark({ bookmark, currentUser, page });
      }
    });

    this._subcriptionObserver =
      !this._currentDocument.isSystemFile && this.subcriptionUpdateBookmark(currentUser._id, document._id);
  }

  destructorBookmark() {
    if (this._subcriptionObserver) {
      this._subcriptionObserver.unsubscribe();
    }
  }

  get bookmarksUser() {
    return this._bookmarks;
  }

  set bookmarksUser(bookmarks) {
    this._bookmarks = bookmarks;
  }

  get activeIndex() {
    return this._activeIndex;
  }

  set activeIndex(page) {
    this._activeIndex = page;
  }

  get undoBookmark() {
    return this._undoBookmark;
  }

  set undoBookmark(undoBookmark) {
    if (this._bookmarks[undoBookmark]) {
      this._undoBookmark[undoBookmark] = this._bookmarks[undoBookmark];
    }
  }

  get prevBookmarks() {
    return this._prevBookmarks;
  }

  set prevBookmarks(bookmarks) {
    this._prevBookmarks = bookmarks;
  }

  set isInOfflineMode(state) {
    this._isInOfflineMode = state;
  }

  // async addBookmark(position, message) {
  //   const docIns = core.getDocument();
  //   const doc = await docIns.getPDFDoc();
  //   return await createBookmark(docIns, doc, parseInt(position), message);
  // }

  removeBookmark(position) {
    delete this._bookmarks[position];
  }

  async generateBookmarks() {
    const bookmarks = [];
    const docIns = core.getDocument();
    const doc = await docIns.getPDFDoc();
    Object.keys(this._bookmarks).forEach((bookmark) => {
      bookmarks.push(createBookmark(docIns, doc, parseInt(bookmark), this._bookmarks[bookmark].message));
    });

    return Promise.all(bookmarks);
  }

  async reGenerateBookmarks() {
    const bookmarks = [...selectors.getBookmarks(getState())];
    const updatedBookmarks = [];
    const indexUpdatedBookmarks = {};
    Object.keys(this._bookmarks).forEach((bookmark, index) => {
      let newBookmark = null;
      const prevBookmark = Object.keys(this._prevBookmarks).find(
        (el) => this._prevBookmarks[el].id === this._bookmarks[bookmark].id
      );
      if (prevBookmark) {
        const ctrlBookmark = bookmarks.find((el) => el.getPageNumber() === parseInt(prevBookmark));
        const newChildBookmark = this.reGenerateChildBookmarks(ctrlBookmark, parseInt(bookmark));
        newBookmark = new core.CoreControls.Bookmark(
          newChildBookmark,
          ctrlBookmark.name,
          parseInt(bookmark),
          null,
          0,
          0
        );
      } else if (!isEmpty(this._updatedBookmarks)) {
        const { message } = this._updatedBookmarks[this._bookmarks[bookmark].id];
        newBookmark = new core.CoreControls.Bookmark([], message, parseInt(bookmark), null, 0, 0);
        indexUpdatedBookmarks[bookmark] = index;
      }
      updatedBookmarks.push(newBookmark);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    updatedBookmarks.length === 0 && fireEvent('removeLastBookmarkFromPageTool');

    dispatch(actions.setBookmarks(updatedBookmarks));
    // for (let updated of Object.values(this._updatedBookmarks)) {
    //   const { page, message } = updated;
    //   const generatedBookmark = await this.addBookmark(parseInt(page), message);
    //   updatedBookmarks[indexUpdatedBookmarks[page]] = generatedBookmark;
    // }
    // dispatch(actions.setBookmarks(updatedBookmarks));
    this._prevBookmarks = null;
    this._updatedBookmarks = {};
  }

  reGenerateChildBookmarks(bookmarks, newPosition) {
    if (!bookmarks.children.length) {
      return [];
    }
    return bookmarks.children.map((child) => {
      const childOfBookmark = this.reGenerateChildBookmarks(child, newPosition);
      return new core.CoreControls.Bookmark(
        childOfBookmark,
        child.name,
        newPosition,
        null,
        child.getVerticalPosition(),
        child.getHorizontalPosition()
      );
    });
  }

  deActiveBookmark(page) {
    const bookmarks = [...selectors.getBookmarks(getState())];
    const position = parseInt(page);
    if (!this._bookmarks[position]) {
      return;
    }
    this.removeBookmark(position);
    const updatedBookmarks = [...bookmarks];
    bookmarks.find((bookmark, index) => {
      const pageBookmark = bookmark.getPageNumber();
      if (pageBookmark === position) {
        updatedBookmarks.splice(index, 1);
        return true;
      }
      return false;
    });
    dispatch(actions.setBookmarks(updatedBookmarks));
  }

  async activeBookmark(page, message) {
    const bookmarks = [...selectors.getBookmarks(getState())];
    const position = parseInt(page);
    if (this._bookmarks[position]) {
      return;
    }
    const id = v4();
    const data = {
      message,
      id,
    };
    this._bookmarks = { ...this._bookmarks, [position]: data };
    if (this._prevBookmarks) {
      this._updatedBookmarks[id] = {
        page: position,
        message,
      };
    } else {
      const optimisticBookmark = new core.CoreControls.Bookmark([], message, position, null, 0, 0);
      const optimisticBookmarks = [...bookmarks, optimisticBookmark];
      dispatch(actions.setBookmarks(optimisticBookmarks));
      // const generatedBookmark = await this.addBookmark(position, message);
      // const updatedBookmarks = [...bookmarks, generatedBookmark];
      // dispatch(actions.setBookmarks(updatedBookmarks));
    }
  }

  setUpBookmark(page) {
    const isPreviewOriginalVersionMode = selectors.isPreviewOriginalVersionMode(getState());
    const pageContainer = document.getElementById(`pageContainer${page}`);
    const isHaveBookMark = pageContainer && pageContainer.querySelector(`#bookMark${page}`);
    if (!isHaveBookMark && pageContainer && !isPreviewOriginalVersionMode) {
      const bookMarkContainer = document.createElement('div');
      bookMarkContainer.id = `bookMark${page}`;
      bookMarkContainer.classList.add('bookmark-container');
      bookMarkContainer.onclick = (e) => {
        e.stopPropagation();
        const state = getState();
        if (!selectors.isPageEditMode(state) && !selectors.isPreviewOriginalVersionMode(state)) {
          this.toggleBookMark(page);
        }
      };
      pageContainer.appendChild(bookMarkContainer);
      // create tooltip for button bookmark
      if (this.rootElements[page]) {
        this.rootElements[page].unmount();
        delete this.rootElements[page];
      }
      const root = createRoot(bookMarkContainer);
      this.rootElements[page] = root;
    }
    core.updateView();
  }

  toggleBookMark(page) {
    if (!this._currentUser) {
      return;
    }
    if (this._bookmarks[page]) {
      if (this._isInOfflineMode) {
        this.updateBookmarkInIndexedDB(page, '');
      } else {
        this.updateBookmark(parseInt(page), '');
      }
      this.deActiveBookmark(page);
      const successToast = {
        message: this.t('documentPage.pageUnBookmarked', { page }),
        top: 130,
      };
      toastUtils.success(successToast);
    } else {
      this.activeIndex = page;
      dispatch(actions.openElement('bookmarkModal'));
    }
  }

  async updatePositionOfBookmark(dataManip) {
    const totalPages = core.getTotalPages();
    const { type, option } = dataManip;
    const newBookmarks = {};
    switch (type) {
      case MANIPULATION_TYPE.MOVE_PAGE: {
        const { pagesToMove, insertBeforePage } = option;
        // eslint-disable-next-line no-restricted-syntax
        for (const bookmark of Object.keys(this._bookmarks)) {
          let position = parseInt(bookmark);
          if (pagesToMove === position) {
            position = insertBeforePage;
          } else if (insertBeforePage <= position && pagesToMove > position) {
            position += 1;
          } else if (insertBeforePage >= position && pagesToMove < position) {
            position -= 1;
          }
          newBookmarks[position] = this._bookmarks[bookmark];
          setTimeout(() => {
          }, 200);
        }
        this._bookmarks = newBookmarks;
        break;
      }
      case MANIPULATION_TYPE.REMOVE_PAGE: {
        const pageRemove = option.pagesRemove[0];
        if (pageRemove === totalPages + 1) {
          delete this._bookmarks[totalPages + 1];
        } else {
          delete this._bookmarks[pageRemove];
        }
        // eslint-disable-next-line no-restricted-syntax
        for (const bookmark of Object.keys(this._bookmarks)) {
          let position = parseInt(bookmark);
          if (position >= pageRemove) {
            position -= 1;
          }
          newBookmarks[position] = this._bookmarks[bookmark];
          setTimeout(() => {
          }, 200);
        }
        this._bookmarks = newBookmarks;
        break;
      }
      case MANIPULATION_TYPE.INSERT_BLANK_PAGE: {
        const pageInsert = option.insertPages[0];
        // eslint-disable-next-line no-restricted-syntax
        for (const bookmark of Object.keys(this._bookmarks)) {
          let position = parseInt(bookmark);
          if (pageInsert <= position) {
            position += 1;
          }
          newBookmarks[position] = this._bookmarks[bookmark];
        }
        this._bookmarks = newBookmarks;
        break;
      }
      case MANIPULATION_TYPE.MERGE_PAGE: {
        const { numberOfPageToMerge, positionToMerge } = option;
        // eslint-disable-next-line no-restricted-syntax
        for (const bookmark of Object.keys(this._bookmarks)) {
          let position = parseInt(bookmark);

          if (positionToMerge <= position) {
            position += numberOfPageToMerge;
          }
          newBookmarks[position] = this._bookmarks[bookmark];
        }
        this._bookmarks = newBookmarks;
        break;
      }
      default: {
        break;
      }
    }
  }

  async revertBookmark(pageRevert) {
    const newBookmarks = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const bookmark of Object.keys(this._bookmarks)) {
      let position = parseInt(bookmark);
      if (pageRevert <= position) {
        position += 1;
      }
      newBookmarks[bookmark] = this._bookmarks[bookmark];

    }
    if (this._undoBookmark && this._undoBookmark[pageRevert]) {
      newBookmarks[pageRevert] = this._undoBookmark[pageRevert];
    }
    this._bookmarks = newBookmarks;
    this._undoBookmark = {};
  }

  async updateBookmarksInSystemFile(page, message) {
    const systemFileCache = await systemFileHandler.get(this._currentDocument._id);
    const bookmarks = systemFileCache.bookmarks ? JSON.parse(systemFileCache.bookmarks) : [];
    const isInBookmarks = bookmarks.some((bookmark) => parseInt(bookmark.page) === page);
    if (message.length === 0 && isInBookmarks) {
      bookmarks.splice(
        bookmarks.findIndex((element) => parseInt(element.page) === page),
        1
      );
      systemFileHandler.update(this._currentDocument._id, { bookmarks: JSON.stringify(bookmarks) });
      dispatch(actions.setCurrentDocument({ ...this._currentDocument, bookmarks: JSON.stringify(bookmarks) }));
    } else {
      const bookmarkData = [];
      Object.entries(this._bookmarks).forEach(([page, value]) => {
        bookmarkData.push({
          bookmark: {
            [this._currentUser.email]: value.message,
          },
          page: page.toString(),
        });
      });
      systemFileHandler.update(this._currentDocument._id, { bookmarks: JSON.stringify(bookmarkData) });
      dispatch(actions.setCurrentDocument({ ...this._currentDocument, bookmarks: JSON.stringify(bookmarkData) }));
    }
  }

  async updateBookmark(page, message) {
    if (this._currentDocument.isSystemFile) {
      this.updateBookmarksInSystemFile(page, message);
    } else {
      const documentCache = await cachingFileHandler.get(this._currentDocument._id);
      if (documentCache) {
        this.updateBookmarkInIndexedDB(page, message);
      }
      documentGraphServices.updateBookmarks({ documentId: this._currentDocument._id, bookmarks: [{ page, message }] });
    }
  }

  updateBookmarkByArray(bookmarks) {
    documentGraphServices.updateBookmarks({ documentId: this._currentDocument._id, bookmarks });
  }

  async updateBookmarkInIndexedDB(page, message) {
    if (this._currentDocument.isSystemFile) {
      this.updateBookmarksInSystemFile(page, message);
    } else {
      const documentCache = await cachingFileHandler.get(this._currentDocument._id);
      const bookmarks = documentCache.bookmarks ? JSON.parse(documentCache.bookmarks) : [];
      const isInBookmarks = bookmarks.some((bookmark) => parseInt(bookmark.page) === page);
      if (message.length === 0 && isInBookmarks) {
        bookmarks.splice(
          bookmarks.findIndex((element) => parseInt(element.page) === page),
          1
        );
      } else {
        const { email } = this._currentUser;
        const pageBookmark = {
          bookmark: [
            {
              email,
              message,
            },
          ],
          page: page.toString(),
        };
        bookmarks.push(pageBookmark);
      }
      await cachingFileHandler.updateDocumentBookmarkInCachingFileById(this._currentDocument._id, bookmarks);
    }
  }

  subcriptionUpdateBookmark(userId, documentId) {
    return documentGraphServices.subUpdateBookmark({
      userId,
      documentId,
      callback: ({ bookmarks }) =>
        bookmarks.forEach(({ page, bookmark: _bookmark }) => {
          const bookmark = _bookmark[0];
          const { message } = bookmark;
          if (message) {
            this.activeBookmark(page, message);
          } else {
            this.deActiveBookmark(page, message);
          }
        }),
    });
  }
}
