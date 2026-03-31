/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Snackbar } from '@mui/material';
import React from 'react';

import ButtonIcon from 'lumin-components/Shared/ButtonIcon';

import { useGetDismissFreeTrialSurveyFlag } from 'features/CNC/hooks';

import { Colors } from 'constants/styles';

import useHandleDismissFreeTrialSurvey from '../../hooks/useHandleDismissFreeTrialSurvey';
import BaseSurvey from '../BaseSurvey';

import styles from './VariantPopover.module.scss';

type Props = {
  onClose: () => void;
};

const VariantPopover = ({ onClose }: Props) => {
  const { isCloseByIcon } = useGetDismissFreeTrialSurveyFlag();
  const { dismissReasonList, itemChecked, onCheckRadio, textareaValue, onChangeTextarea, onCloseModal, onSubmit } =
    useHandleDismissFreeTrialSurvey({
      onClose,
    });

  return (
    <Snackbar open anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <div className={styles.container}>
        {isCloseByIcon && (
          <ButtonIcon
            // @ts-ignore
            icon="cancel"
            iconColor={Colors.LUMIN_SIGN_PRIMARY}
            iconSize={14}
            onClick={onCloseModal}
            className={styles.closeIcon}
          />
        )}
        <BaseSurvey
          list={dismissReasonList}
          selectedItem={itemChecked}
          onSelectItem={onCheckRadio}
          textareaValue={textareaValue}
          onChangeTextarea={onChangeTextarea}
          onSubmit={onSubmit}
          onClose={onCloseModal}
        />
      </div>
    </Snackbar>
  );
};

export default VariantPopover;
