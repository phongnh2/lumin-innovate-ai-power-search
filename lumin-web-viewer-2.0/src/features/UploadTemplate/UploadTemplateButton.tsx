import { PlusIcon } from '@luminpdf/icons/dist/csr/Plus';
import { FileButton, Button } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';
import { compose } from 'redux';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useTranslation } from 'hooks/useTranslation';

import { acceptedMimeType } from 'constants/documentType';

interface UploadTemplateButtonProps {
  onFilesPicked: (files: any[]) => void;
}

const UploadTemplateButton = ({ onFilesPicked }: UploadTemplateButtonProps) => {
  const { t } = useTranslation();
  const resetRef = useRef<() => void>(null);

  const handleFileChange = (files: File[]) => {
    if (files && files.length > 0 && onFilesPicked) {
      const uploadFiles = Object.keys(files).map((key) => files[key as keyof typeof files]);
      onFilesPicked(uploadFiles);
    }
    resetRef.current?.();
  };

  return (
    <FileButton accept={acceptedMimeType.join(',')} onChange={handleFileChange} multiple resetRef={resetRef}>
      {({ ...props }) => (
        <Button {...props} startIcon={<PlusIcon size={24} />} size="lg">
          {t('common.templates')}
        </Button>
      )}
    </FileButton>
  );
};

export default compose(withDropDocPopup.Consumer, React.memo)(UploadTemplateButton);
