import classNames from 'classnames';
import { Dialog } from 'lumin-ui/kiwi-ui';
import React from 'react';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useEnabledMultipleMerge } from 'features/MultipleMerge/hooks/useEnabledMultipleMerge';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { MultipleMergeStep } from '../../enum';
import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';
import FormContainer from '../FormContainer/FormContainer';
import MultipleMergeBody from '../MultipleMergeBody/MultipleMergeBody';
import MultipleMergeFooter from '../MultipleMergeFooter/MultipleMergeFooter';
import MultipleMergeHeader from '../MultipleMergeHeader/MultipleMergeHeader';
import MultipleMergeProvider from '../MultipleMergeProvider/MultipleMergeProvider';
import PremiumModal from '../PremiumModal/PremiumModal';

import styles from './MultipleMergeModal.module.scss';

type MultipleMergeModalProps = {
  children: React.ReactNode;
  initialDocuments: IDocumentBase[];
  onClose: () => void;
  onFilesPicked: (files: File[]) => Promise<void>;
};

type MultipleMergeModalContentProps = {
  onClose: () => void;
};

const MultipleMergeModalContent = ({ onClose }: MultipleMergeModalContentProps) => {
  const { currentStep, openSaveToDriveModal } = useMultipleMergeContext();

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <MultipleMergeHeader />
        </div>
        <div
          className={classNames([
            styles.body,
            currentStep === MultipleMergeStep.SAVE_DOCUMENT && styles.saveDocumentBody,
            openSaveToDriveModal && styles.saveToDriveModalBody,
          ])}
        >
          <MultipleMergeBody />
        </div>
        <div className={styles.footer}>
          <MultipleMergeFooter onClose={onClose} />
        </div>
      </div>
      <PremiumModal />
    </>
  );
};

const MultipleMergeModal = ({ initialDocuments, onClose, onFilesPicked }: MultipleMergeModalProps) => {
  const { enabled } = useEnabledMultipleMerge();

  if (!enabled) {
    return null;
  }

  return (
    <Dialog data-cy="multiple-merge-modal" closeOnClickOutside={false} closeOnEscape={false} opened onClose={onClose}>
      <MultipleMergeProvider initialDocuments={initialDocuments} onClose={onClose} onFilesPicked={onFilesPicked}>
        <FormContainer>
          <MultipleMergeModalContent onClose={onClose} />
        </FormContainer>
      </MultipleMergeProvider>
    </Dialog>
  );
};

export default withDropDocPopup.Consumer(MultipleMergeModal);
