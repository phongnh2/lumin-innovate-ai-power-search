import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { ConvertPdfModal } from './components/ConvertPdfModal';
import { useConvertPdfStore } from './hooks/useConvertPdfStore';
import { useHandleConvertPdf } from './hooks/useHandleConvertPdf';

const ConvertPdf = () => {
  const { t } = useTranslation();
  const { showModalConvertPdf } = useConvertPdfStore();

  const { onConvertPdf, isLoading } = useHandleConvertPdf();

  return (
    <div>
      <Button size="lg" onClick={onConvertPdf} loading={isLoading} data-cy="convert_pdf_button">
        {t('viewer.convertPDF.button')}
      </Button>
      {showModalConvertPdf && <ConvertPdfModal />}
    </div>
  );
};

export default ConvertPdf;
