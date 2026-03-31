/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-cycle */
/* eslint-disable no-await-in-loop */
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
// eslint-disable-next-line import/no-unresolved
import { UploadIcon } from '@luminpdf/icons/dist/csr/Upload';
import classNames from 'classnames';
import { range, debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import v4 from 'uuid/v4';

import actions from 'actions';
import core from 'core';

import { googleServices } from 'services';

import { passwordHandlers } from 'helpers/passwordHandlers';

import { eventTracking, file as fileUtils } from 'utils';

import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';

import UserEventConstants from 'constants/eventConstants';

import EmptyView from './components/EmptyView';
import MergeMainView from './components/MergeMainView';
import {
  ERROR_MESSAGE_TYPE,
  MERGE_CHECKBOX_EVENT,
  MERGE_EVENTS,
  MERGE_EVENTS_PURPOSE,
  OTHER_SOURCE_FILE,
} from './constants';

import styles from './MergePanel.module.scss';

const propsTypes = {
  closeElement: PropTypes.func,
  openElement: PropTypes.func,
};

const MergePanelContext = React.createContext();

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const MergePanel = ({ closeElement, openElement }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const initialState = {
    filesInfo: [],
    errorUploadFile: '',
    pagePosition: 1,
    pagesInsert: '',
    pagePositionErrorMessage: '',
    pageInsertErrorMessage: '',
    allPages: false,
    loading: false,
  };

  const [panelData, setPanelData] = useState(initialState);
  const inputFileRef = useRef();
  const googlePickerFileRef = useRef();

  const {
    filesInfo,
    errorUploadFile,
    pagePosition,
    pagesInsert,
    pagePositionErrorMessage,
    pageInsertErrorMessage,
    allPages,
    loading,
  } = panelData;

  const updateState = useCallback((updates) => {
    setPanelData((prevState) => ({ ...prevState, ...updates }));
  }, []);

  const validatePositionPage = useCallback(
    debounce(() => {
      const totalPages = core.getTotalPages();
      const isValid = pagePosition <= totalPages && pagePosition > 0;
      updateState({
        pagePositionErrorMessage: isValid ? '' : t(ERROR_MESSAGE_TYPE.INVALID_PAGE_POSITION),
      });
    }, 150),
    [pagePosition, t, updateState]
  );

  useEffect(() => {
    validatePositionPage();
  }, [validatePositionPage]);

  const handleInputPositionChange = useCallback(
    (event) => {
      const { value } = event.target;
      updateState({ pagePosition: value });
    },
    [updateState]
  );

  const onPagesUpdated = useCallback(
    (changes) => {
      const { added, removed } = changes;
      if (added.length || removed.length) {
        validatePositionPage();
      }
    },
    [validatePositionPage]
  );

  useEffect(() => {
    core.docViewer.addEventListener('pagesUpdated', onPagesUpdated);
    return () => {
      core.docViewer.removeEventListener('pagesUpdated', onPagesUpdated);
    };
  }, [onPagesUpdated]);

  const preCheckingFileUpload = useCallback(
    (file) => {
      const { type } = file;

      if (!featureStoragePolicy.isFeatureEnabledForMimeType(AppFeatures.MERGE_FILE, type)) {
        const error = t(ERROR_MESSAGE_TYPE.PDF_UNSUPPORT_TYPE);

        updateState({
          loading: false,
          errorUploadFile: error,
        });
        throw new Error(error);
      }
    },
    [t, updateState]
  );

  const createFileInfo = useCallback(
    async (file, fileSource, error) =>
      new Promise(async (resolve, reject) => {
        const baseErrorFile = {
          docInstance: {
            id: v4(),
          },
          file,
          error,
        };
        let passwordModalOpenedByThisFile = false;
        let attempt = 0;
        try {
          const docInstance = await core.CoreControls.createDocument(file, {
            password: (fn) => {
              attempt++;
              passwordHandlers.setCheckFn(fn);
              passwordHandlers.setCancelFn(() => {
                // eslint-disable-next-line prefer-promise-reject-errors
                reject({
                  message: 'User cancel!',
                  newFile: { ...baseErrorFile, error: t('viewer.mergePagePanel.failToUploadEncrypted') },
                });
              });
              dispatch(actions.setPasswordAttempts(attempt));
              passwordModalOpenedByThisFile = true;
              openElement('passwordModal');
            },
            loadAsPDF: featureStoragePolicy.isFeatureEnabledForMimeType(AppFeatures.MERGE_FILE, file.type),
          });
          const totalPages = docInstance.getPageCount();
          const thumbnailCanvas = await fileUtils.getThumbnailWithDocument(docInstance, { thumbSize: 60 });
          const minPage = 1;
          const maxPage = totalPages;
          const rangeAllPages = range(1, totalPages + 1);
          const rangeAllPageString = minPage === maxPage ? `${maxPage}` : `${minPage}-${maxPage}`;
          const newFile = {
            docInstance,
            thumbnail: thumbnailCanvas.toDataURL(),
            file,
            totalPages,
            rangeAllPages,
            rangeAllPageString,
            fileSource,
            error,
          };
          const pdfDoc = await docInstance.getPDFDoc();
          await pdfDoc.removeSecurity();
          resolve(newFile);
          if (passwordModalOpenedByThisFile) {
            closeElement('passwordModal');
          }
        } catch (error) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            message: 'Broken file!',
            newFile: { ...baseErrorFile, error: t('viewer.mergePagePanel.failToUploadPleaseRemove') },
          });
        }
      }),
    [t, openElement, closeElement]
  );

  const findDummyLoading = useCallback(
    (fileList, id) =>
      fileList.findIndex(
        ({ file, docInstance, loading: isLoading }) => (file.id === id || docInstance.id === id) && isLoading
      ),
    []
  );

  const findAndRemoveDummyLoading = useCallback(
    (id) => {
      setPanelData((prevState) => {
        const _filesInfo = [...prevState.filesInfo];
        const index = findDummyLoading(_filesInfo, id);
        _filesInfo.splice(index, 1);
        return { ...prevState, filesInfo: _filesInfo };
      });
    },
    [findDummyLoading]
  );

  const processFile = useCallback(
    async (source, file, docsId, error) => {
      const createdFile = await createFileInfo(file, source, error);
      setPanelData((prevState) => {
        const arr = [...prevState.filesInfo];
        if (docsId) {
          const foundIndex = findDummyLoading(arr, docsId);
          arr.splice(foundIndex, 0, createdFile);
        } else {
          arr.push(createdFile);
        }
        return {
          ...prevState,
          errorUploadFile: '',
          pageInsertErrorMessage: '',
          pagePositionErrorMessage: '',
          pagesInsert: prevState.filesInfo.length === 0 ? createdFile.rangeAllPageString : '',
          pagePosition: 1,
          allPages: true,
          filesInfo: arr,
        };
      });
    },
    [preCheckingFileUpload, createFileInfo, findDummyLoading]
  );

  const setErrorFile = useCallback(
    (newFile, docsId) => {
      setPanelData((prevState) => {
        const arr = [...prevState.filesInfo];
        if (docsId) {
          const foundIndex = findDummyLoading(arr, docsId);
          arr.splice(foundIndex, 0, newFile);
        } else {
          arr.push(newFile);
        }

        return { ...prevState, filesInfo: arr };
      });
    },
    [findDummyLoading]
  );

  const setDefaultError = useCallback(() => {
    updateState({
      errorUploadFile: t(ERROR_MESSAGE_TYPE.DEFAULT),
    });
    throw new Error(t(ERROR_MESSAGE_TYPE.DEFAULT));
  }, [t, updateState]);

  const handleGoogleFileChange = useCallback(
    async (data) => {
      updateState({
        loading: true,
        errorUploadFile: '',
      });

      for (const doc of data.docs) {
        try {
          const tempFile = {
            docInstance: {
              id: v4(),
            },
            file: doc,
            error: t('viewer.mergePagePanel.failToUploadPleaseRemove'),
          };

          setPanelData((prevState) => ({
            ...prevState,
            pageInsertErrorMessage: '',
            errorUploadFile: '',
            filesInfo: [...prevState.filesInfo, { ...tempFile, loading: true }],
            pagePositionErrorMessage: '',
          }));

          const _fileInfo = await googleServices.getFileInfo(doc.id, '*', 'handleGoogleFileChange');
          const _file = await googleServices.downloadFile(doc.id, _fileInfo.name);
          await processFile(OTHER_SOURCE_FILE.GOOGLE, _file, doc.id);
        } catch ({ newFile }) {
          if (newFile) {
            setErrorFile(newFile, doc.id);
            // eslint-disable-next-line no-continue
            continue;
          } else {
            setDefaultError();
          }
        } finally {
          findAndRemoveDummyLoading(doc.id);
        }
      }

      updateState({
        loading: false,
      });
    },
    [updateState, setPanelData, processFile, setErrorFile, setDefaultError, findAndRemoveDummyLoading]
  );

  const handleLocalFileChange = useCallback(
    async (event) => {
      const { files } = event.target;

      if (files.length > 0) {
        updateState({
          loading: true,
        });
        for (const file of files) {
          let error;
          if (!featureStoragePolicy.isFeatureEnabledForMimeType(AppFeatures.MERGE_FILE, file.type)) {
            error = t(ERROR_MESSAGE_TYPE.PDF_UNSUPPORT_TYPE);
          }
          const tempFile = {
            docInstance: {
              id: v4(),
            },
            file,
            error,
          };

          setPanelData((prevState) => ({
            ...prevState,
            pageInsertErrorMessage: '',
            errorUploadFile: '',
            filesInfo: [...prevState.filesInfo, { ...tempFile, loading: true }],
            pagePositionErrorMessage: '',
          }));

          try {
            await processFile(OTHER_SOURCE_FILE.LOCAL, tempFile.file, tempFile.docInstance.id, tempFile?.error);
          } catch ({ newFile }) {
            if (newFile) {
              setErrorFile(newFile, tempFile.docInstance.id);
              // eslint-disable-next-line no-continue
              continue;
            } else {
              setDefaultError();
            }
          } finally {
            findAndRemoveDummyLoading(tempFile.docInstance.id);
          }
        }
        updateState({
          loading: false,
        });
      }
    },
    [updateState, setPanelData, processFile, setErrorFile, setDefaultError, findAndRemoveDummyLoading]
  );

  const setPagesInsert = useCallback(
    (pagesToInsert) => {
      updateState({ pagesInsert: pagesToInsert });
    },
    [updateState]
  );

  const removeUploadedFile = useCallback((index) => {
    inputFileRef.current.value = null;

    setPanelData((prevState) => {
      const _filesInfo = [...prevState.filesInfo];
      _filesInfo.splice(index, 1);
      return {
        ...prevState,
        pagePositionErrorMessage: '',
        filesInfo: _filesInfo,
        pagesInsert: _filesInfo.length === 1 ? _filesInfo[0].rangeAllPageString : '',
        errorUploadFile: '',
        pageInsertErrorMessage: '',
      };
    });

    eventTracking(UserEventConstants.EventType.CLICK, {
      elementPurpose: MERGE_EVENTS_PURPOSE[MERGE_EVENTS.REMOVE_UPLOAD_FILES_IN_MERGE],
      elementName: MERGE_EVENTS.REMOVE_UPLOAD_FILES_IN_MERGE,
    });
  }, []);

  const toggleAllPage = useCallback((checkboxValue) => {
    let status;
    const fireMergeCheckboxEvent = (_status) => {
      eventTracking(MERGE_CHECKBOX_EVENT.TYPE, { ...MERGE_CHECKBOX_EVENT.PARAMS, status: _status });
    };

    if (!checkboxValue) {
      status = 'checked';

      setPanelData((prevState) => ({
        ...prevState,
        pagesInsert: prevState.filesInfo[0].rangeAllPageString,
        pageInsertErrorMessage: '',
        allPages: true,
      }));
    } else {
      status = 'unchecked';

      setPanelData((prevState) => ({
        ...prevState,
        allPages: false,
      }));
    }
    fireMergeCheckboxEvent(status);
  }, []);

  const setPageInsertErrorMessage = useCallback(
    (value) => {
      updateState({ pageInsertErrorMessage: value });
    },
    [updateState]
  );

  const setPagePositionErrorMessage = useCallback(
    (value) => {
      updateState({ pagePositionErrorMessage: value });
    },
    [updateState]
  );

  const setLoading = useCallback(
    (value) => {
      updateState({ loading: value });
    },
    [updateState]
  );

  const onDrop = useCallback(
    (result) => {
      const _filesInfo = reorder(filesInfo, result.source.index, result.destination.index);
      updateState({ filesInfo: _filesInfo });
    },
    [filesInfo, updateState]
  );

  const resetMergePanelState = useCallback(() => {
    setPanelData(initialState);
    if (inputFileRef.current) {
      inputFileRef.current.value = null;
    }
  }, []);

  const onDropFiles = useCallback(
    async (files, fileRejections) => {
      const mergeFiles = [...files, ...fileRejections];
      if (mergeFiles.length > 0) {
        updateState({
          loading: true,
        });
        for (const file of mergeFiles) {
          let tempFile;
          if (file.errors) {
            tempFile = {
              docInstance: {
                id: v4(),
              },
              file: file.file,
              error: t(ERROR_MESSAGE_TYPE.PDF_UNSUPPORT_TYPE),
            };
          } else {
            tempFile = {
              docInstance: {
                id: v4(),
              },
              file,
            };
          }

          setPanelData((prevState) => ({
            ...prevState,
            pageInsertErrorMessage: '',
            errorUploadFile: '',
            filesInfo: [...prevState.filesInfo, { ...tempFile, loading: true }],
            pagePositionErrorMessage: '',
          }));

          try {
            await processFile(OTHER_SOURCE_FILE.LOCAL, tempFile.file, tempFile.docInstance.id, tempFile?.error);
          } catch ({ newFile }) {
            if (newFile) {
              setErrorFile(newFile, tempFile.docInstance.id);
              // eslint-disable-next-line no-continue
              continue;
            } else {
              setDefaultError();
            }
          } finally {
            findAndRemoveDummyLoading(tempFile.docInstance.id);
          }
        }
        updateState({
          loading: false,
        });
      }
    },
    [updateState, t, setPanelData, processFile, setErrorFile, setDefaultError, findAndRemoveDummyLoading]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => onDropFiles(acceptedFiles, fileRejections),
    accept: featureStoragePolicy.getSupportedMimeTypes(AppFeatures.MERGE_FILE).join(','),
  });

  const contextValue = useMemo(
    () => ({
      inputFileRef,
      googlePickerFileRef,
      handleLocalFileChange,
      handleGoogleFileChange,
      filesInfo,
      removeUploadedFile,
      toggleAllPage,
      setPagesInsert,
      handleInputPositionChange,
      setPageInsertErrorMessage,
      setPagePositionErrorMessage,
      setLoading,
      onDrop,
      isDragActive,
      resetMergePanelState,
    }),
    [
      inputFileRef,
      googlePickerFileRef,
      handleLocalFileChange,
      handleGoogleFileChange,
      filesInfo,
      removeUploadedFile,
      toggleAllPage,
      setPagesInsert,
      handleInputPositionChange,
      setPageInsertErrorMessage,
      setPagePositionErrorMessage,
      setLoading,
      onDrop,
      isDragActive,
      resetMergePanelState,
    ]
  );

  return (
    <MergePanelContext.Provider value={contextValue}>
      <div
        className={classNames(styles.mergePanelContainer, {
          [styles.dragActive]: filesInfo.length !== 0,
        })}
        {...getRootProps()}
      >
        {filesInfo.length ? (
          <MergeMainView
            filesInfo={filesInfo}
            pagesInsert={pagesInsert}
            pagePosition={pagePosition}
            allPages={allPages}
            pageInsertErrorMessage={pageInsertErrorMessage}
            pagePositionErrorMessage={pagePositionErrorMessage}
            loading={loading}
            errorUploadFile={errorUploadFile}
          />
        ) : (
          <DragDropContext onDragEnd={onDrop}>
            <Droppable droppableId="merge-panel">
              {(dropProvided) => (
                <div {...dropProvided.droppableProps} ref={dropProvided.innerRef}>
                  <EmptyView {...dropProvided} />
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
        <div
          className={classNames(styles.mergeDragContainer, {
            [styles.visible]: isDragActive && filesInfo.length !== 0,
          })}
        >
          <div className={styles.mergeDragBackground} />
          <div className={styles.mergeDragOverlay}>
            <div className={styles.mergeDragOverlayContent}>
              <UploadIcon size={20} color="var(--kiwi-colors-core-on-secondary)" />
              <p className={styles.title}>{t('viewer.mergePagePanel.dragOverlayTitle')}</p>
            </div>
          </div>
        </div>
      </div>
    </MergePanelContext.Provider>
  );
};

MergePanel.propTypes = propsTypes;

export default MergePanel;
export { MergePanelContext };
