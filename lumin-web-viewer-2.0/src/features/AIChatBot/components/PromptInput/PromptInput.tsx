import classNames from 'classnames';
import { Divider, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';

import { ATTACHED_FILES_STATUS } from 'features/AIChatBot/constants/attachedFiles';
import { AI_MODE } from 'features/AIChatBot/constants/mode';
import { useUploadAttachedFiles } from 'features/AIChatBot/hooks/useUploadAttachedFiles';
import { AIModeType } from 'features/AIChatBot/interface';

import ButtonSubmit from './ButtonSubmit';
import { useFocusManager, useInputHandler, useSelectedMark, useSubmitHandler } from '../../hooks';
import AIAgentMode from '../AIMode/AIAgentMode';
import ChatBotUploadPopover from '../ChatBotUploadPopover';
import SelectedFilesList from '../SelectedFilesList';

import styles from './PromptInput.module.scss';

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  isSendDisabled?: boolean;
  onSubmit?: () => void;
  setValueState: (value: string) => void;
  disabledSubmit?: boolean;
  inputPromptRef: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
  isProcessing?: boolean;
  placeholder?: string;
  stop?: () => void;
  stopCallback?: () => void;
  chatSessionId?: string;
  enabledFileUpload?: boolean;
  enabledSwitchMode?: boolean;
  AIMode?: string;
  modes?: AIModeType[];
};

const PromptInput: React.FC<Props> = (props: Props) => {
  const {
    setValueState,
    onSubmit,
    disabledSubmit,
    inputPromptRef,
    isProcessing,
    placeholder,
    stop,
    stopCallback,
    chatSessionId,
    enabledFileUpload,
    enabledSwitchMode,
    AIMode,
    modes,
    ...otherProps
  } = props;

  const { attachedFiles, isUploadingFiles, handleAddFiles, handleRemoveFiles } = useUploadAttachedFiles();
  const selectedFiles = useMemo(
    () => (attachedFiles || []).filter((file) => file.status !== ATTACHED_FILES_STATUS.SENT),
    [attachedFiles]
  );

  const { resetSelectedMark, removeSelectedMark, handleMarkClick } = useSelectedMark(inputPromptRef);

  const { focusInput, handleWrapperBlur, handleWrapperFocus, handleInputFocus } = useFocusManager(resetSelectedMark);

  const { handleInput, handleKeyDown } = useInputHandler({
    inputRef: inputPromptRef,
    setValueState,
    onSubmit,
    disabledSubmit,
    isProcessing,
    removeSelectedMark,
    isUploadingFiles,
  });

  const { handleSubmit, cancelRequest } = useSubmitHandler({
    onSubmit,
    disabledSubmit,
    isProcessing,
    stop,
    stopCallback,
    isUploadingFiles,
  });

  return (
    <div className={styles.container}>
      <div
        data-cy="chatbot_input_wrapper"
        role="textbox"
        tabIndex={0}
        {...otherProps}
        onKeyDown={handleKeyDown}
        className={classNames(styles.wrapper, {
          [styles.focusContainer]: focusInput,
        })}
        onFocus={handleWrapperFocus}
        onBlur={handleWrapperBlur}
        data-disabled-upload={!enabledFileUpload}
      >
        {enabledFileUpload && (
          <SelectedFilesList files={selectedFiles} isUploadingFile={isUploadingFiles} onRemove={handleRemoveFiles} />
        )}
        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <div
              role="textbox"
              aria-label="Chatbot input"
              tabIndex={0}
              ref={inputPromptRef}
              id="chatBotInput"
              className={classNames('custom-scrollbar', styles.input)}
              onFocus={handleInputFocus}
              data-placeholder={placeholder}
              data-empty={!inputPromptRef.current?.innerText.trim()}
              onInput={handleInput}
              contentEditable="plaintext-only"
              onClick={handleMarkClick}
            />
          </div>
        </div>

        <div data-disabled-upload={!enabledFileUpload} className={styles.actionsRow}>
          <div className={styles.actionsRowContainer}>
            {enabledFileUpload && (
              <div onFocus={(e) => e.stopPropagation()}>
                <ChatBotUploadPopover
                  handleAddFiles={(addFileProps) => handleAddFiles({ ...addFileProps, chatSessionId })}
                />
              </div>
            )}
            {enabledSwitchMode && (
              <>
                <Divider orientation="vertical" className={styles.divider} />
                <AIAgentMode modes={modes} AIMode={AIMode || AI_MODE.ASK_MODE} />
              </>
            )}
          </div>
          <div className={styles.buttonContainer}>
            {isProcessing ? (
              <ButtonSubmit
                className={styles.stopButton}
                variant="tonal"
                onClick={cancelRequest}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M12.5 2.5H3.5C3.23478 2.5 2.98043 2.60536 2.79289 2.79289C2.60536 2.98043 2.5 3.23478 2.5 3.5V12.5C2.5 12.7652 2.60536 13.0196 2.79289 13.2071C2.98043 13.3946 3.23478 13.5 3.5 13.5H12.5C12.7652 13.5 13.0196 13.3946 13.2071 13.2071C13.3946 13.0196 13.5 12.7652 13.5 12.5V3.5C13.5 3.23478 13.3946 2.98043 13.2071 2.79289C13.0196 2.60536 12.7652 2.5 12.5 2.5ZM12.5 12.5H3.5V3.5H12.5V12.5Z"
                      fill="var(--kiwi-colors-surface-on-surface)"
                    />
                  </svg>
                }
              />
            ) : (
              <ButtonSubmit
                disabled={disabledSubmit || isUploadingFiles}
                onClick={handleSubmit}
                icon={<Icomoon type="send-lg" size="sm" />}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
