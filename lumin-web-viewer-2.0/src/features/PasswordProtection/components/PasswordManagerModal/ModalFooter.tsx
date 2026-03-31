import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import styles from './PasswordManagerModal.module.scss';

interface ModalFooterProps {
  onClose: () => void;
  loading: boolean;
  submitText: string;
  cancelText: string;
  isFormDirty?: boolean;
}

const ModalFooter = ({ onClose, loading, submitText, cancelText, isFormDirty }: ModalFooterProps) => (
  <div className={styles.buttonContainer}>
    <Button
      size="lg"
      data-element="passwordCancelButton"
      variant="text"
      type="button"
      style={{ minWidth: 80 }}
      onClick={onClose}
      disabled={loading}
    >
      {cancelText}
    </Button>
    <Button
      loading={loading}
      size="lg"
      data-element="passwordSubmitButton"
      type="submit"
      style={{ minWidth: 80 }}
      variant="tonal"
      disabled={loading || !isFormDirty}
    >
      {submitText}
    </Button>
  </div>
);

export default ModalFooter;
