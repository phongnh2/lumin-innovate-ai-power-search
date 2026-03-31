import React from 'react';

import SecondaryToolbar from '@new-ui/components/SecondaryToolbar';

import FreeTextToolbar from 'features/FreeTextToolbar';
import MeasureToolbar from 'features/MeasureTool/components/MeasureToolbar';
import RedactToolbar from 'features/Redact/components/RedactToolbar';

import { useFloatingToolbarActive } from './hooks/useFloatingToolbarActive';

const FloatingToolbar = () => {
  const {
    style,
    annotation,
    isRedactionToolActive,
    isMeasurementToolActive,
    isFreeTextToolbarActive,
    shouldShowFloatingToolbar,
    onClose,
  } = useFloatingToolbarActive();

  return (
    <SecondaryToolbar active={shouldShowFloatingToolbar}>
      {isMeasurementToolActive && <MeasureToolbar />}
      {isRedactionToolActive && <RedactToolbar />}
      {isFreeTextToolbarActive && (
        <>
          <SecondaryToolbar.Container hasCloseButton>
            <FreeTextToolbar style={style} annotation={annotation} />
          </SecondaryToolbar.Container>
          <SecondaryToolbar.CloseButton onClick={onClose} />
        </>
      )}
    </SecondaryToolbar>
  );
};

export default FloatingToolbar;
