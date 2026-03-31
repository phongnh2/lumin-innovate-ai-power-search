import array from 'utils/array';
/* eslint-disable default-param-last */
export default (initialState) =>
  (state = initialState, action) => {
    const { type, payload } = action;

  switch (type) {
    case 'SET_DOCUMENT_FILE':
      return {
        ...state, file: payload.documentFile, path: payload.documentFile.name, pdfDoc: null,
      };
    case 'SET_PAGE_NUMBER':
      return { ...state, pageNumber: payload.documentPageNumber };
    case 'SET_TOTAL_PAGES':
      return { ...state, totalPages: payload.totalPages };
    case 'SET_OUTLINES':
      return { ...state, outlines: payload.outlines };
    case 'SET_BOOKMARKS':
      return { ...state, bookmarks: payload.bookmarks };
    case 'SET_LAYERS':
      return { ...state, layers: payload.layers };
    case 'SET_PASSWORD_ATTEMPTS':
      return { ...state, passwordAttempts: payload.attempt };
    case 'SET_PASSWORD_MESSAGE':
      return { ...state, passwordMessage: payload.message };
    case 'SET_PASSWORD_MODAL_SOURCE':
      return { ...state, passwordModalSource: payload.source };
    case 'SET_PASSWORD_PROTECTED_DOCUMENT_NAME':
      return { ...state, passwordProtectedDocumentName: payload.name };
    case 'SET_PRINT_QUALITY':
      return { ...state, printQuality: payload.quality };
    case 'SET_LOADING_PROGRESS':
      return { ...state, loadingProgress: payload.progress };
    case 'UPDATE_THUMBS':
      return { ...state, lumin_thumbs: payload.thumbs, newlyPagesAdded: payload.newlyPagesAdded };
    case 'ADD_THUMBS': {
      const { position, thumbs } = payload;
      const thumbsUpdate = [...state.lumin_thumbs];
      thumbsUpdate.splice(position, 0, thumbs);
      return { ...state, lumin_thumbs: thumbsUpdate.map((thumb, idx) => ({
        ...thumb,
        pageIndex: idx + 1,
      })) };
    }
    case 'INSERT_BLANK_THUMBS': {
      const { from, blankThumbnails } = payload;
      const cloneThumbs = [...state.lumin_thumbs];
      cloneThumbs.splice(from, 0, ...blankThumbnails);
      return {
        ...state,
        lumin_thumbs: cloneThumbs.map((thumb, idx) => ({
          ...thumb,
          pageIndex: idx + 1,
        })),
      };
    }
    case 'DELETE_THUMBS': {
      const thumbs = array.removeElementFromArrayByIndex({
          array: state.lumin_thumbs.map((thumb) => ({
              ...thumb,
              pageIndex: payload.position < thumb.pageIndex ? thumb.pageIndex - 1 : thumb.pageIndex,
            })),
          removeIndex: payload.position,
        });
      return { ...state, lumin_thumbs: thumbs };
    }
    case 'DELETE_MULTIPLE_THUMBS': {
      const newThumbs = state.lumin_thumbs.filter((thumb) => !payload.positions.includes(thumb.pageIndex));
      return {
        ...state,
        lumin_thumbs: newThumbs.map((thumb, index) => ({
          ...thumb,
          pageIndex: index + 1,
        })),
      };
    }
    case 'DISABLE_THUMB': {
      const thumbs = state.lumin_thumbs.map((thumb) => {
        if (thumb.pageIndex === payload.position) {
          thumb.willBeDeleted = true;
        }
        return thumb;
      });
      return { ...state, lumin_thumbs: thumbs };
    }
    case 'ENABLE_THUMB': {
      const thumbs = state.lumin_thumbs.map((thumb) => {
        if (thumb.pageIndex === payload.position) {
          thumb.willBeDeleted = false;
        }
        return thumb;
      });
      return { ...state, lumin_thumbs: thumbs };
    }
    case 'SET_NEWLY_PAGES_ADDED':
      return { ...state,
        newlyPagesAdded: payload.newlyPagesAdded,
        allNewlyPagesAdded: [...state.allNewlyPagesAdded, ...payload.newlyPagesAdded]
      };
    case 'SET_CARE_TAKER':
      return { ...state, lumin_careTaker: payload.careTaker };
    case 'SET_CAN_MODIFY_DRIVE_CONTENT':
      return { ...state, canModifyDriveContent: payload.canModifyDriveContent };
    case 'RESET_DOCUMENT':
      return { ...initialState };
    default:
      return state;
  }
};
