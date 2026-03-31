import { isValidElement } from 'react';

import { useAppSelector } from '@/lib/hooks';
import DownMood from '@/public/assets/down-mood.svg';
import ExclamationIcon from '@/public/assets/exclamation.svg';
import { isModalProcessing } from '@/selectors';

import Button, { ButtonColor } from '../Button';
import Loading from '../Loading/Loading';
import { Text } from '../Text';

import Dialog from './Dialog';
import { ConfirmationDialogProps } from './interfaces';
import { DialogSize, DialogType } from './types';

import * as Styled from './Dialog.styled';

export const getIcon = ({ type, props }: { type: DialogType; props?: Record<string, any> }): React.ReactElement =>
  ({
    [DialogType.Success]: <ExclamationIcon {...props} />,
    [DialogType.Error]: <ExclamationIcon {...props} />,
    [DialogType.Warn]: <ExclamationIcon {...props} />,
    [DialogType.Info]: <ExclamationIcon {...props} />,
    [DialogType.Mood]: <DownMood {...props} />
  }[type]);

function ConfirmationDialog({
  message,
  confirmText,
  onConfirm,
  disableConfirm,
  onCancel,
  type,
  title,
  size,
  cancelText,
  messageAlign,
  onClose,
  ...otherProps
}: ConfirmationDialogProps): JSX.Element {
  const isProcessing = useAppSelector(state => isModalProcessing(state));
  const renderPrimaryButtonContent = () => {
    if (isProcessing) {
      return <Loading />;
    }
    return confirmText;
  };
  return (
    <Dialog
      {...otherProps}
      size={size}
      onClose={() => {
        if (isProcessing) return;
        onClose && onClose();
      }}
      title={
        <Styled.ConfirmTitleWrapper>
          {getIcon({ type, props: { height: 48 } })}
          <Styled.ConfirmTitle level={4} align='center'>
            {title}
          </Styled.ConfirmTitle>
        </Styled.ConfirmTitleWrapper>
      }
    >
      {isValidElement(message) ? message : <Text align={messageAlign}>{message}</Text>}
      <Styled.Footer column={onCancel ? 2 : 1}>
        {onCancel && (
          <Button onClick={onCancel} color={ButtonColor.TERTIARY} fullWidth disabled={isProcessing}>
            {cancelText}
          </Button>
        )}
        <Button onClick={onConfirm} fullWidth disabled={disableConfirm || isProcessing}>
          {renderPrimaryButtonContent()}
        </Button>
      </Styled.Footer>
    </Dialog>
  );
}

ConfirmationDialog.defaultProps = {
  confirmText: 'OK',
  type: DialogType.Warn,
  size: DialogSize.SM,
  cancelText: 'Cancel',
  messageAlign: 'center'
};

export default ConfirmationDialog;
