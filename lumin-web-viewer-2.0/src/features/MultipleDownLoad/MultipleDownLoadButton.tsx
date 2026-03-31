import { Button, IconButton, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import useHandleDownloadMultipleDocs from 'features/MultipleDownLoad/hooks/useHandleDownloadMultipleDocs';
import { useBulkActionIconButton } from 'features/WebChatBot/hooks/useBulkActionIconButton';

type Props = {
  disabled?: boolean;
};

const MultipleDownLoadButton = ({ disabled = false }: Props) => {
  const { t } = useTranslation();
  const isBulkActionIconButton = useBulkActionIconButton();
  const { onDownload } = useHandleDownloadMultipleDocs();

  if (isBulkActionIconButton) {
    return (
      <IconButton
        icon="download-lg"
        onClick={onDownload}
        variant="elevated"
        data-cy="download_button"
        disabled={disabled}
        className="kiwi-button--elevated-without-shadow"
      />
    );
  }

  return (
    <Button
      variant="elevated"
      onClick={onDownload}
      startIcon={<KiwiIcomoon size="md" type="download-lg" color="var(--kiwi-colors-core-secondary)" />}
      data-cy="download_button"
      disabled={disabled}
      className="kiwi-button--elevated-without-shadow"
    >
      {t('common.download')}
    </Button>
  );
};

export default MultipleDownLoadButton;
