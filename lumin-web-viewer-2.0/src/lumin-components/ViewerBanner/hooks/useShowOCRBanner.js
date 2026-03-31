import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import core from 'core';
import selectors from "selectors";

const useShowOCRBanner = () => {

  const shouldShowOCRBanner = useSelector(selectors.shouldShowOCRBanner);
  const isPreviewOriginalVersionMode = useSelector(selectors.isPreviewOriginalVersionMode);
  const isOffline = useSelector(selectors.isOffline);
  const [isFormFieldMode, setIsFormFieldMode] = useState();
  const [isContentEditMode, setIsInContentEditMode] = useState();

  const onFormFieldCreationModeStarted = () => {
    setIsFormFieldMode(true);
  };

  const onFormFieldCreationModeEnded = () => {
    setIsFormFieldMode(false);
  };

  const handleContentEditModeStart = () => {
    setIsInContentEditMode(true);
  };

  const handleContentEditModeEnd = () => {
    setIsInContentEditMode(false);
  };

  useEffect(() => {
    const formFieldCreationManager = core.getFormFieldCreationManager();

    formFieldCreationManager.addEventListener('formFieldCreationModeStarted', onFormFieldCreationModeStarted);
    formFieldCreationManager.addEventListener('formFieldCreationModeEnded', onFormFieldCreationModeEnded);
    core.addEventListener('contentEditModeStarted', handleContentEditModeStart);
    core.addEventListener('contentEditModeEnded', handleContentEditModeEnd);
    return () => {
      formFieldCreationManager.removeEventListener('formFieldCreationModeStarted', onFormFieldCreationModeStarted);
      formFieldCreationManager.removeEventListener('formFieldCreationModeEnded', onFormFieldCreationModeEnded);
      core.removeEventListener('contentEditModeStarted', handleContentEditModeStart);
      core.removeEventListener('contentEditModeEnded', handleContentEditModeEnd);
    };

  }, []);

  return shouldShowOCRBanner && !isFormFieldMode && !isContentEditMode && !isOffline && !isPreviewOriginalVersionMode;
};

export default useShowOCRBanner;