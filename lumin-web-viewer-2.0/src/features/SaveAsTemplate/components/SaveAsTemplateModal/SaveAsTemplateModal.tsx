import { FileTextDashedIcon } from '@luminpdf/icons/dist/csr/FileTextDashed';
import { Modal, Select, TextInput, Avatar } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';
import DefaultTeamAvatar from 'assets/reskin/lumin-svgs/default-team-avatar.png';

import selectors from 'selectors';

import { DestinationLocation } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import avatarUtils from 'utils/avatar';
import fileUtils from 'utils/file';

import { useGetCurrentOrg } from 'features/SaveAsTemplate/hooks/useGetCurrentOrg';
import useGetSelectOptions from 'features/SaveAsTemplate/hooks/useGetSelectOptions';
import useSaveAsTemplateHandler from 'features/SaveAsTemplate/hooks/useSaveAsTemplateHandler';

import styles from './SaveAsTemplateModal.module.scss';

type SelectOption = {
  option: {
    type: DestinationLocation;
    avatarRemoteId: string;
    label: string;
    value: string;
  };
};

const SaveAsTemplateModal = () => {
  const { t } = useTranslation();
  const currentOrg = useGetCurrentOrg();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const options = useGetSelectOptions(currentOrg);
  const { handler, closeModal } = useSaveAsTemplateHandler(currentOrg);
  const [templateName, setTemplateName] = useState(
    `${fileUtils.getFilenameWithoutExtension(currentDocument.name)} Template`
  );
  const [selectedDestination, setSelectedDestination] = useState(() => {
    // Default to first available option (my-templates)
    const firstOption = options[0]?.items?.[0];
    return firstOption
      ? {
          type: firstOption.type,
          id: firstOption.id,
          label: firstOption.label,
          value: firstOption.value,
        }
      : null;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const onClose = () => {
    closeModal();
  };

  const handleConfirm = async () => {
    if (!selectedDestination || !templateName.trim()) {
      setError(t('errorMessage.fieldRequired'));
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await handler({
        templateName: templateName.trim(),
        selectedDestination,
        isNotify: false,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDestinationChange = (value: string) => {
    let foundOption = null;
    // eslint-disable-next-line no-restricted-syntax
    for (const group of options) {
      foundOption = group.items.find((item) => item.value === value);
      if (foundOption) break;
    }

    if (foundOption) {
      setSelectedDestination({
        type: foundOption.type,
        id: foundOption.id,
        label: foundOption.label,
        value: foundOption.value,
      });
    }
  };

  const onTemplateNameBlur = () => {
    if (!templateName.trim()) {
      setError(t('errorMessage.fieldRequired'));
    }
  };

  const onTemplateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateName(e.target.value);
  };

  const renderOption = (item: SelectOption) => {
    const option = item.option as unknown as { type: DestinationLocation; avatarRemoteId: string; label: string };
    return (
      <div className={styles.menuItem}>
        {option.type === DestinationLocation.PERSONAL ? (
          <FileTextDashedIcon size={20} />
        ) : (
          <Avatar
            src={
              avatarUtils.getAvatar(option.avatarRemoteId) ||
              (option.type === DestinationLocation.ORGANIZATION ? DefaultOrgAvatar : DefaultTeamAvatar)
            }
            variant="outline"
            size="xs"
          />
        )}
        <span>{item.option.label}</span>
      </div>
    );
  };

  return (
    <Modal
      opened
      onClose={onClose}
      onConfirm={handleConfirm}
      onCancel={onClose}
      confirmButtonProps={{
        title: t('viewer.saveAsTemplate.saveTemplate'),
        disabled: isProcessing || !templateName.trim() || !selectedDestination,
        loading: isProcessing,
      }}
      cancelButtonProps={{
        title: t('action.cancel'),
        disabled: isProcessing,
      }}
      title={t('viewer.saveAsTemplate.title')}
      size="md"
    >
      <TextInput
        placeholder={t('viewer.saveAsTemplate.templateName')}
        label={t('viewer.saveAsTemplate.templateName')}
        value={templateName}
        onChange={onTemplateNameChange}
        onBlur={onTemplateNameBlur}
        error={error}
      />
      <Select
        label={t('viewer.saveAsTemplate.saveTo')}
        data={options}
        classNames={{
          option: styles.menuItemWrapper,
          /* LMV-6980 Temporary fix for the dropdown padding */
          dropdown: styles.selectDropdown,
        }}
        value={selectedDestination?.value || 'my-templates'}
        onChange={handleDestinationChange}
        disabled={isProcessing}
        renderOption={renderOption}
      />
    </Modal>
  );
};

export default SaveAsTemplateModal;
