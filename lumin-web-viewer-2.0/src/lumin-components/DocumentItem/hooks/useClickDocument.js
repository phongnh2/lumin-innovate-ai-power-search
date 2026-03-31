import { useCallback, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router';

import CookieWarningContext from 'luminComponents/CookieWarningModal/Context';
import { DocumentListContext } from 'luminComponents/DocumentList/Context';

import { DocumentViewerOpenFrom } from 'utils/Factory/EventCollection/constants/DocumentEvent';
import { getLanguage, getLanguageFromUrl } from 'utils/getLanguage';

import { featureStoragePolicy } from 'features/FeatureConfigs';

import { LANGUAGES } from 'constants/language';
import { CHECKBOX_TYPE } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { BASEURL } from 'constants/urls';

export function useClickDocument({
  isDisabled,
  document: selectedDocument,
  shiftHoldingRef,
  lastSelectedDocIdRef,
  isDisabledSelection,
  handleSelectedItems,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setCookieModalVisible, cookiesDisabled } = useContext(CookieWarningContext);
  const { externalDocumentExistenceGuard } = useContext(DocumentListContext) || {};

  const selectDocuments = useCallback(
    (selected) => {
      const type = selected ? CHECKBOX_TYPE.SELECT : CHECKBOX_TYPE.DESELECT;
      if (!shiftHoldingRef.current) {
        lastSelectedDocIdRef.current = selectedDocument._id;
      }
      if (isDisabledSelection) {
        return;
      }
      handleSelectedItems({
        currentItem: selectedDocument,
        lastSelectedDocId: lastSelectedDocIdRef.current,
        checkboxType: type,
      });
    },
    [isDisabledSelection, selectedDocument]
  );

  const onCheckboxChange = useCallback(
    (e) => {
      selectDocuments(e.target.checked);
    },
    [selectDocuments]
  );

  const onClickDocument = useCallback(() => {
    if (isDisabled) {
      return;
    }
    if (cookiesDisabled && featureStoragePolicy.externalStorages.includes(selectedDocument.service)) {
      setCookieModalVisible(true);
      return;
    }
    externalDocumentExistenceGuard(selectedDocument, () => {
      const language = getLanguage();
      const languageUrl = getLanguageFromUrl();
      if (language !== languageUrl && language !== LANGUAGES.EN) {
        const url = `${BASEURL}/${language}${Routers.VIEWER}/${selectedDocument._id}`;
        window.location.replace(url);
      } else {
        navigate(`${Routers.VIEWER}/${selectedDocument._id}`, {
          state: {
            previousPath: pathname,
            folderName: selectedDocument.folderData?.name,
            openFrom: DocumentViewerOpenFrom.DOC_LIST,
          },
        });
      }
    });
  }, [cookiesDisabled, selectedDocument, isDisabled, navigate, pathname]);

  return {
    onCheckboxChange,
    onClickDocument,
  };
}
