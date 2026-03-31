import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { LayoutElements } from 'lumin-components/GeneralLayout/constants';

import { useLatestRef } from 'hooks/useLatestRef';

import { CUSTOM_EVENT } from 'constants/customEvent';

const useChangeLayoutListener = () => {
  const dispatch = useDispatch();
  const isRightPanelOpen = useSelector(selectors.isRightPanelOpen);
  const rightPanelValue = useSelector(selectors.rightPanelValue);
  const isSearchOverlayOpen = useSelector(selectors.isOpenSearchOverlay);

  const isRightPanelOpenRef = useLatestRef(isRightPanelOpen);
  const rightPanelValueRef = useLatestRef(rightPanelValue);
  const isSearchOverlayOpenRef = useLatestRef(isSearchOverlayOpen);

  useEffect(() => {
    const handleToggleableElement = (elementName) => {
      if (isRightPanelOpenRef.current && rightPanelValueRef.current === elementName) {
        return { Element: LayoutElements.DEFAULT, Status: false };
      }

      if (isRightPanelOpenRef.current && rightPanelValueRef.current === LayoutElements.SEARCH) {
        dispatch(actions.setSearchOverlayValue(false));
      }

      return { Element: elementName, Status: true };
    };

    const onLayoutUpdate = (event) => {
      const {
        detail: { elementName = LayoutElements.DEFAULT, isOpen = false },
      } = event;

      const updatedLayout = {
        Status: false,
        Element: null,
      };

      switch (elementName) {
        case LayoutElements.SEARCH_OVERLAY: {
          if (!isRightPanelOpenRef.current || rightPanelValueRef.current !== LayoutElements.SEARCH) {
            // using return to show only searching overlay and do not update general layout
            dispatch(actions.setSearchOverlayValue(!isSearchOverlayOpenRef.current));
            return;
          }
          Object.assign(updatedLayout, { Element: LayoutElements.DEFAULT, Status: false });
          break;
        }
        case LayoutElements.SEARCH: {
          Object.assign(updatedLayout, { Element: LayoutElements.SEARCH, Status: true });
          break;
        }
        case LayoutElements.NOTE_HISTORY:
        case LayoutElements.CHATBOT:
        case LayoutElements.SUMMARIZATION:
        case LayoutElements.INVOICE_EXTRACTOR:
        case LayoutElements.RESUME_CHECKER:
        case LayoutElements.TRANSLATOR: {
          Object.assign(updatedLayout, handleToggleableElement(elementName));
          break;
        }
        case LayoutElements.COMMENT_PANEL: {
          dispatch(actions.setDisplayCommentPanel(isOpen));
          return;
        }
        case LayoutElements.DEFAULT:
        default: {
          Object.assign(updatedLayout, { Element: elementName, Status: isOpen });
          break;
        }
      }

      if (updatedLayout.Status !== isRightPanelOpenRef.current) {
        dispatch(actions.setIsRightPanelOpen(updatedLayout.Status));
      }

      if (updatedLayout.Element && updatedLayout.Element !== rightPanelValueRef.current) {
        dispatch(actions.setRightPanelValue(updatedLayout.Element));
      }
    };

    window.addEventListener(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, onLayoutUpdate);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, onLayoutUpdate);
    };
  }, []);
};

export default useChangeLayoutListener;
