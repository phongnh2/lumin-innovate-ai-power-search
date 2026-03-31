import comment from 'utils/comment';

import { LocalStorageKey } from 'constants/localStorageKey';
import { INTEGRATE_LUMIN_SIGN_MODAL } from 'constants/luminSign';

export default (initialState) =>
  (state = initialState, action = {}) => {
    const { type, payload } = action;

    // eslint-disable-next-line sonarjs/max-switch-cases
    switch (type) {
      case 'SET_DOC_VIEWER': {
        return { ...state, docViewer: payload.docViewer };
      }
      case 'SET_CORE_CONTROLS': {
        return { ...state, CoreControls: payload.CoreControls };
      }
      case 'RESET_VIEWER': {
        return {
          ...state.docViewer,
          ...state.CoreControls,
          ...initialState,
          themeMode: state.themeMode,
        };
      }
      case 'DISABLE_ELEMENT': {
        return {
          ...state,
          disabledElements: {
            ...state.disabledElements,
            [payload.dataElement]: { disabled: true, priority: payload.priority },
          },
        };
      }
      case 'DISABLE_ELEMENTS': {
        const disabledElements = {};
        payload.dataElements.forEach((dataElement) => {
          disabledElements[dataElement] = {};
          disabledElements[dataElement].disabled = true;
          disabledElements[dataElement].priority = payload.priority;
        });

        return { ...state, disabledElements: { ...state.disabledElements, ...disabledElements } };
      }
      case 'DISABLE_FEATURES': {
        const disabledFeatures = {};
        payload.forEach((feature) => {
          disabledFeatures[feature] = true;
        });

        return {
          ...state,
          disabledFeatures: { ...state.disabledFeatures, ...disabledFeatures },
        };
      }
      case 'ENABLE_ELEMENT':
        return {
          ...state,
          disabledElements: {
            ...state.disabledElements,
            [payload.dataElement]: { disabled: false, priority: payload.priority },
          },
        };
      case 'ENABLE_ELEMENTS': {
        const disabledElements = {};
        payload.dataElements.forEach((dataElement) => {
          disabledElements[dataElement] = {};
          disabledElements[dataElement].disabled = false;
          disabledElements[dataElement].priority = payload.priority;
        });

        return { ...state, disabledElements: { ...state.disabledElements, ...disabledElements } };
      }
      case 'ENABLE_ALL_ELEMENTS':
        return { ...state, disabledElements: { ...initialState.disabledElements } };
      case 'ENABLE_FEATURES': {
        const disabledFeatures = {};
        payload.forEach((feature) => {
          disabledFeatures[feature] = false;
        });

        return {
          ...state,
          disabledFeatures: { ...state.disabledFeatures, ...disabledFeatures },
        };
      }
      case 'OPEN_ELEMENT':
        return { ...state, openElements: { ...state.openElements, [payload.dataElement]: true } };
      case 'CLOSE_ELEMENT':
        return { ...state, openElements: { ...state.openElements, [payload.dataElement]: false } };
      case 'SET_ACTIVE_HEADER_GROUP':
        return { ...state, activeHeaderGroup: payload.headerGroup };
      case 'SET_ACTIVE_TOOL_NAME':
        return { ...state, activeToolName: payload.toolName };
      case 'SET_ACTIVE_TOOL_STYLES':
        return { ...state, activeToolStyles: { ...payload.toolStyles } };
      case 'SET_ACTIVE_TOOL_NAME_AND_STYLES':
        return { ...state, activeToolName: payload.toolName, activeToolStyles: payload.toolStyles };
      case 'SET_FORCE_RELOAD':
        return { ...state, forceReload: payload.forceReload };
      case 'SET_DISCARD_CONTENT_EDIT':
        return { ...state, discardContentEdit: payload.discardContentEdit };
      case 'SET_UPLOAD_DOC_VISIBLE':
        return { ...state, uploadDocVisible: payload };
      case 'SET_ACTIVE_LEFT_PANEL':
        return { ...state, activeLeftPanel: payload.dataElement };
      case 'SET_ACTIVE_TOOL_GROUP':
        return { ...state, activeToolGroup: payload.toolGroup };
      case 'SET_NOTE_POPUP_ID':
        return { ...state, notePopupId: payload.id };
      case 'SET_NOTE_EDITING':
        return { ...state, isNoteEditing: payload.isNoteEditing };
      case 'SET_FIT_MODE':
        return { ...state, fitMode: payload.fitMode };
      case 'SET_ZOOM':
        return { ...state, zoom: payload.zoom };
      case 'SET_ROTATION':
        return { ...state, rotation: payload.rotation };
      case 'SET_DISPLAY_MODE':
        return { ...state, displayMode: payload.displayMode };
      case 'SET_CURRENT_PAGE':
        return { ...state, currentPage: payload.currentPage };
      case 'SET_SORT_STRATEGY':
        return { ...state, sortStrategy: payload.sortStrategy };
      case 'SET_SHOW_NOTES_OPTION':
        return { ...state, showNotesOption: payload.showNotesOption };
      case 'SET_NOTE_DATE_FORMAT':
        return { ...state, noteDateFormat: payload.noteDateFormat };
      case 'SET_FULL_SCREEN':
        return { ...state, isFullScreen: payload.isFullScreen };
      case 'ENTER_PRESENTER_MODE': {
        return {
          ...state,
          isFullScreen: false,
          presenterMode: {
            isInPresenterMode: true,
            restoreState: { ...payload.restoreState },
          },
        };
      }
      case 'EXIT_PRESENTER_MODE': {
        return {
          ...state,
          isFullScreen: false,
          presenterMode: {
            isInPresenterMode: false,
            restoreState: null,
          },
        };
      }
      case 'SET_HEADER_ITEMS':
        return { ...state, headers: { ...state.headers, [payload.header]: payload.headerItems } };
      case 'SET_POPUP_ITEMS':
        return {
          ...state,
          [payload.dataElement]: payload.items,
        };
      case 'REGISTER_TOOL':
        return {
          ...state,
          toolButtonObjects: {
            ...state.toolButtonObjects,
            [payload.toolName]: {
              dataElement: payload.buttonName,
              title: payload.tooltip,
              group: payload.buttonGroup,
              img: payload.buttonImage,
              showColor: payload.showColor || 'active',
            },
          },
        };
      case 'UNREGISTER_TOOL': {
        const newToolButtonObjects = { ...state.toolButtonObjects };
        delete newToolButtonObjects[payload.toolName];
        return { ...state, toolButtonObjects: newToolButtonObjects };
      }
      case 'UPDATE_TOOL': {
        const { toolName, properties } = payload;
        const { buttonName, tooltip, buttonGroup, buttonImage } = properties;
        return {
          ...state,
          toolButtonObjects: {
            ...state.toolButtonObjects,
            [toolName]: {
              ...state.toolButtonObjects[toolName],
              dataElement: buttonName || state.toolButtonObjects[toolName].dataElement,
              title: tooltip || state.toolButtonObjects[toolName].title,
              group: buttonGroup !== undefined ? buttonGroup : state.toolButtonObjects[toolName].group,
              img: buttonImage || state.toolButtonObjects[toolName].img,
            },
          },
        };
      }
      case 'SET_THUMBNAIL_MERGING':
        return { ...state, isThumbnailMerging: payload.useThumbnailMerging };
      case 'SET_THUMBNAIL_REORDERING':
        return { ...state, isThumbnailReordering: payload.useThumbnailReordering };
      case 'SET_THUMBNAIL_MULTISELECT':
        return { ...state, isThumbnailMultiselect: payload.useThumbnailMultiselect };
      case 'SET_MULTI_VIEWER_MERGING':
        return { ...state, isMultipleViewerMerging: payload.isMultipleViewerMerging };
      case 'SET_ALLOW_PAGE_NAVIGATION':
        return { ...state, allowPageNavigation: payload.allowPageNavigation };
      case 'SET_READ_ONLY':
        return { ...state, isReadOnly: payload.isReadOnly };
      case 'SET_CUSTOM_PANEL':
        return { ...state, customPanels: [...state.customPanels, payload.newPanel] };
      case 'USE_EMBEDDED_PRINT':
        return { ...state, useEmbeddedPrint: payload.useEmbeddedPrint };
      case 'SET_PAGE_LABELS':
        return { ...state, pageLabels: [...payload.pageLabels] };
      case 'SET_SELECTED_THUMBNAIL_PAGE_INDEXES':
        return { ...state, selectedThumbnailPageIndexes: payload.selectedThumbnailPageIndexes };
      case 'SET_ACTIVE_PALETTE': {
        const { colorMapKey, colorPalette } = payload;
        return {
          ...state,
          colorMap: {
            ...state.colorMap,
            [colorMapKey]: { ...state.colorMap[colorMapKey], currentPalette: colorPalette },
          },
        };
      }
      case 'SET_REPLY_DISABLED_FUNC': {
        const { func } = payload;
        return {
          ...state,
          isReplyDisabledFunc: func,
        };
      }
      case 'SET_ICON_COLOR': {
        const { colorMapKey, color } = payload;
        return {
          ...state,
          colorMap: { ...state.colorMap, [colorMapKey]: { ...state.colorMap[colorMapKey], iconColor: color } },
        };
      }
      case 'SET_COLOR_MAP':
        return { ...state, colorMap: payload.colorMap };
      case 'SET_WARNING_MESSAGE':
        return { ...state, warning: payload };
      case 'SET_ERROR_MESSAGE':
        return { ...state, errorMessage: payload.message };
      case 'SET_CUSTOM_NOTE_FILTER':
        return { ...state, customNoteFilter: payload.customNoteFilter };
      case 'SET_ZOOM_LIST':
        return { ...state, zoomList: payload.zoomList };
      case 'OPEN_PAGE_EDIT_MODE': {
        return {
          ...state,
          isPageEditMode: true,
        };
      }
      case 'CLOSE_PAGE_EDIT_MODE': {
        return {
          ...state,
          isPageEditMode: false,
        };
      }
      case 'CHANGE_PAGE_EDIT_DISPLAY_MODE': {
        const { displayMode } = payload;
        return {
          ...state,
          pageEditMode: {
            ...state.pageEditMode,
            displayMode,
          },
        };
      }
      case 'SET_ACTIVE_EDIT_MODE': {
        return {
          ...state,
          isActiveEditMode: true,
        };
      }
      case 'SET_DEACTIVE_EDIT_MODE': {
        return {
          ...state,
          isActiveEditMode: false,
        };
      }
      case 'SET_MEASUREMENT_UNITS': {
        return { ...state, measurementUnits: payload };
      }
      case 'SET_MAX_SIGNATURES_COUNT':
        return { ...state, maxSignaturesCount: payload.maxSignaturesCount };
      case 'SET_IS_SAVING_SIGNATURE':
        return { ...state, isSavingSignature: payload.isSavingSignature };
      case 'SET_USER_DATA':
        return { ...state, userData: payload.userData };
      case 'SET_CUSTOM_MEASUREMENT_OVERLAY':
        return { ...state, customMeasurementOverlay: payload.customMeasurementOverlay };
      case 'SET_SIGNATURE_FONTS':
        return { ...state, signatureFonts: payload.signatureFonts };
      case 'SET_SELECTED_TAB':
        return { ...state, tab: { ...state.tab, [payload.id]: payload.dataElement } };
      case 'SET_USER_SIGNATURE_STATUS':
        return {
          ...state,
          signatureStatus: {
            ...state.signatureStatus,
            ...payload.status,
          },
        };
      case 'SET_THEME_MODE': {
        return {
          ...state,
          themeMode: payload.themeMode,
        };
      }
      case 'SET_IS_SHOW_TOP_BAR': {
        return {
          ...state,
          isShowTopBar: payload.isShowTopBar,
        };
      }

      case 'SET_IS_SHOW_TOOLBAR_TABLET': {
        return {
          ...state,
          isShowToolbarTablet: payload.isShowToolbarTablet,
        };
      }

      case 'SET_IS_SHOW_BANNER_ADS': {
        return {
          ...state,
          isShowBannerAds: payload.isShowBannerAds,
        };
      }
      case 'SET_IS_SHOW_TOP_VIEWER_BANNER': {
        return {
          ...state,
          isShowTopViewerBanner: payload.isShowTopViewerBanner,
        };
      }
      case 'SET_CUSTOM_ELEMENT_OVERRIDES':
        return {
          ...state,
          customElementOverrides: {
            ...state.customElementOverrides,
            [payload.dataElement]: payload.overrides,
          },
        };
      case 'SET_NOTE_TRANSFORM_FUNCTION':
        return { ...state, noteTransformFunction: payload.noteTransformFunction };
      case 'SET_ANNOTATION_CONTENT_OVERLAY_HANDLER':
        return { ...state, annotationContentOverlayHandler: payload.annotationContentOverlayHandler };
      case 'SET_ANNOTATIONS_LOADED':
        return {
          ...state,
          annotationsLoaded: payload.annotationsLoaded,
        };
      case 'SET_COMMENT_LOCATION': {
        const { originLocation } = payload;
        const { idealPlacement: oldIdealPlacement, selectedCommentId } = state.commentPlacement;
        const idealPlacement = comment.getIdealPlacement(originLocation, selectedCommentId);
        if (JSON.stringify(oldIdealPlacement) === JSON.stringify(idealPlacement)) {
          return {
            ...state,
          };
        }

        return {
          ...state,
          commentPlacement: {
            ...state.commentPlacement,
            originLocation,
            idealPlacement,
          },
        };
      }
      case 'SET_SELECTED_COMMENT': {
        const { selectedCommentId } = payload;
        const { originLocation } = state.commentPlacement;

        const idealPlacement = comment.getIdealPlacement(originLocation, selectedCommentId);

        return {
          ...state,
          commentPlacement: {
            ...state.commentPlacement,
            idealPlacement,
            selectedCommentId,
          },
        };
      }
      case 'SCROLL_TO_PAGE_GRID_VIEW_MODE':
        return { ...state, gridViewMode: payload.gridViewMode };
      case 'RESET_GRID_VIEW_MODE':
        return { ...state, gridViewMode: { ...initialState.gridViewMode } };
      case 'SET_DOCUMENT_NOT_FOUND':
        return {
          ...state,
          isNotFoundDocument: true,
        };
      case 'RESET_DOCUMENT_NOT_FOUND':
        return {
          ...state,
          isNotFoundDocument: false,
        };
      case 'SET_AUTO_SYNC_STATUS':
        return { ...state, autoSyncStatus: payload.autoSyncStatus };

      case 'SET_INITIAL_WIDGET_XFDF':
        return { ...state, initialWidgetXfdf: payload.initialWidgetXfdf };
      case 'SET_COMMENT_PANEL_LAYOUT_STATE':
        return { ...state, commentPanelLayoutState: payload.state };
      case 'SET_CURRENT_CONTENT_BEING_EDITED':
        return {
          ...state,
          currentContentBeingEdited: payload,
        };
      case 'UPDATE_CURRENT_CONTENT_BEING_EDITED':
        return {
          ...state,
          currentContentBeingEdited: {
            ...state.currentContentBeingEdited,
            content: payload.content,
          },
        };
      case 'CLEAR_CURRENT_CONTENT_BEING_EDITED':
        return {
          ...state,
          currentContentBeingEdited: null,
        };
      case 'SET_PLACING_MULTIPLE_SIGNATURES':
        return {
          ...state,
          isPlacingMultipleSignatures: payload.isPlacingMultipleSignatures,
        };
      case 'SET_SELECTED_SIGNATURE':
        return {
          ...state,
          selectedSignature: payload.signature,
        };
      case 'SET_MINIMIZE_BANANA_SIGN':
        return {
          ...state,
          isMinimizeBananaSign: payload.isMinimizeBananaSign,
        };
      case 'OPEN_TOOL_MODAL_BY_TYPE':
        return {
          ...state,
          modalToolType: payload,
        };
      case 'CLOSE_TOOL_MODAL_BY_TYPE':
        return {
          ...state,
          modalToolType: '',
        };
      case 'SET_SIGNATURE_WIDGET_SELECTED':
        return {
          ...state,
          signatureWidgetSelected: payload.signatureWidgetSelected,
        };
      case 'SET_HAS_APPLIED_REDACTION':
        return {
          ...state,
          hasAppliedRedaction: payload.hasAppliedRedaction,
        };
      case 'OPEN_PREVIEW_ORIGINAL_VERSION_MODE':
        return {
          ...state,
          isPreviewOriginalVersionMode: true,
        };
      case 'CLOSE_PREVIEW_ORIGINAL_VERSION_MODE':
        return {
          ...state,
          isPreviewOriginalVersionMode: false,
        };
      case 'SET_IS_IN_CONTENT_EDIT_MODE':
        return {
          ...state,
          isInContentEditMode: payload.isInContentEditMode,
        };
      case 'SET_IS_USING_RICHTEXT':
        return { ...state, isUsingRichText: payload.isUsingRichText };
      case 'SET_EDIT_PDF_VERSION':
        return {
          ...state,
          editPdfVersion: payload.editPdfVersion,
        };
      case 'SET_SHOULD_SHOW_RATING':
        return {
          ...state,
          shouldShowRating: payload.shouldShowRating,
        };
      case 'SET_IS_LOADING_DOCUMENT':
        return {
          ...state,
          isLoadingDocument: payload.isLoadingDocument,
        };
      case 'SET_IS_DOCUMENT_LOADED':
        return {
          ...state,
          isDocumentLoaded: payload.isDocumentLoaded,
        };
      case 'SET_INTERNAL_ANNOTATION_IDS':
        return {
          ...state,
          internalAnnotationIds: payload.internalAnnotationIds,
        };
      case 'SETUP_VIEWER_LOADING_MODAL':
        return {
          ...state,
          viewerLoadingModalData: {
            ...state.viewerLoadingModalData,
            ...payload,
          },
        };

      case 'RESET_VIEWER_LOADING_MODAL':
        return {
          ...state,
          viewerLoadingModalData: {
            ...initialState.viewerLoadingModalData,
          },
        };
      case 'STEPPING_VIEWER_LOADING_MODAL':
        return {
          ...state,
          viewerLoadingModalData: { ...state.viewerLoadingModalData, currentStep: payload.currentStep },
        };
      case 'SET_SHOW_INTEGRATE_LUMIN_SIGN_MODAL': {
        const { modalName, isShow } = payload;
        const updateProperty =
          modalName === INTEGRATE_LUMIN_SIGN_MODAL.INTEGRATION_MODAL ? 'isOpenIntegrateModal' : 'isOpenSignModal';
        const updatedState = {
          ...state,
          integrateModal: { ...state.integrateModal },
        };

        updatedState.integrateModal[updateProperty] = isShow;
        return updatedState;
      }
      case 'SET_PLACING_MULTIPLE_RUBBER_STAMP': {
        localStorage.setItem(LocalStorageKey.IS_PLACING_MULTIPLE_RUBBER_STAMP, payload.isPlacingMultipleRubberStamp);
        return {
          ...state,
          isPlacingMultipleRubberStamp: payload.isPlacingMultipleRubberStamp,
        };
      }
      case 'SET_RUBBER_STAMPS': {
        return {
          ...state,
          rubberStamp: {
            ...state.rubberStamp,
            rubberStamps: [...state.rubberStamp.rubberStamps, ...payload.rubberStamps.data],
            total: payload.rubberStamps.total,
          },
        };
      }

      case 'SET_RUBBER_STAMPS_SKIP': {
        return {
          ...state,
          rubberStamp: { ...state.rubberStamp, skip: payload.skip },
        };
      }

      case 'SET_RUBBER_STAMPS_SHOULD_FETCH_ON_INIT': {
        return {
          ...state,
          rubberStamp: { ...state.rubberStamp, shouldFetchOnInit: payload.shouldFetchOnInit },
        };
      }

      case 'OVERRIDE_WHOLE_RUBBER_STAMP_LIST': {
        return {
          ...state,
          rubberStamp: {
            ...state.rubberStamp,
            rubberStamps: [...payload.rubberStamps.data],
            total: payload.rubberStamps.total || state.rubberStamp.total,
          },
        };
      }

      case 'SET_IS_CONVERTING_BASE64_TO_SIGNED_URL': {
        return {
          ...state,
          isConvertingBase64ToSignedUrl: payload.isConvertingBase64ToSignedUrl,
        };
      }

      case 'SET_DISPLAY_QR_CODE_DIALOG': {
        return {
          ...state,
          isOpenQRCode: payload.shouldDisplay,
        };
      }

      case 'SET_SHOW_OCR_BANNER': {
        return {
          ...state,
          shouldShowOCRBanner: payload.shouldShowOCRBanner,
        };
      }

      case 'SET_TOOL_AUTO_ENABLED': {
        return {
          ...state,
          toolAutoEnabled: payload.toolId,
        };
      }

      case 'SET_DOWNLOAD_TYPE': {
        return {
          ...state,
          downloadType: payload.downloadType,
        };
      }

      case 'SET_NOTE_EDITING_ANNOTATION_ID': {
        return {
          ...state,
          noteEditingAnnotationId: payload.noteEditingAnnotationId,
        };
      }

      case 'SET_IS_DOCUMENT_READY': {
        return {
          ...state,
          isDocumentReady: payload.isDocumentReady,
        };
      }

      case 'SET_OUTLINE_EVENT': {
        return {
          ...state,
          activeOutlineEvent: payload.outlineEvent,
        };
      }

      case 'SET_LOADING_DOCUMENT_OUTLINES': {
        return {
          ...state,
          isLoadingGetDocumentOutlines: payload.isLoadingGetDocumentOutlines,
        };
      }

      case 'SET_IS_SUMMARIZING': {
        return {
          ...state,
          isSummarizing: payload.isSummarizing,
        };
      }

      case 'SET_IS_REGENERATING_SUMMARY': {
        return {
          ...state,
          isRegeneratingSummary: payload.isRegeneratingSummary,
        };
      }

      case 'SET_CURRENT_SUMMARY_DOC_VERSION': {
        return {
          ...state,
          currentSummaryDocVersion: payload.currentSummaryDocVersion,
        };
      }

      case 'SET_OPENED_ELEMENT_DATA': {
        return {
          ...state,
          openedElementData: { ...state.openedElementData, [payload.dataElement]: payload.openedElementData },
        };
      }

      case 'SET_BACK_DROP_MESSAGE': {
        return {
          ...state,
          backDropMessage: payload.message,
          backDropConfigs: payload.configs,
        };
      }

      case 'SET_ENABLE_EMBEDDED_JAVASCRIPT': {
        return {
          ...state,
          isEnableEmbeddedJavascript: payload.isEnableEmbeddedJavascript,
        };
      }

      case 'SET_FLATTEN_PDF': {
        return {
          ...state,
          flattenPdf: payload.flattenPdf,
        };
      }

      case 'SET_IS_WAITING_FOR_EDIT_BOXES': {
        return {
          ...state,
          isWaitingForEditBoxes: payload.isWaitingForEditBoxes,
        };
      }

      case 'SET_SHOULD_SHOW_INVITE_COLLABORATORS_MODAL': {
        return {
          ...state,
          shouldShowInviteCollaboratorsModal: payload.shouldShowInviteCollaboratorsModal,
        };
      }

      case 'SET_SHOW_TRIAL_MODAL': {
        return {
          ...state,
          showTrialModal: payload.showTrialModal,
        };
      }

      default:
        return state;
    }
  };
