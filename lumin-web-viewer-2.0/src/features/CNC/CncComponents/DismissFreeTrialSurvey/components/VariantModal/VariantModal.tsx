/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';

import ButtonIcon from 'lumin-components/Shared/ButtonIcon';

import { useGetDismissFreeTrialSurveyFlag } from 'features/CNC/hooks';

import { Colors } from 'constants/styles';

import useHandleDismissFreeTrialSurvey from '../../hooks/useHandleDismissFreeTrialSurvey';
import BaseSurvey from '../BaseSurvey';

import styles from './VariantModal.module.scss';

type Props = {
  onClose: () => void;
};

const VariantModal = ({ onClose }: Props) => {
  const { isCloseByIcon } = useGetDismissFreeTrialSurveyFlag();
  const { dismissReasonList, itemChecked, onCheckRadio, textareaValue, onChangeTextarea, onCloseModal, onSubmit } =
    useHandleDismissFreeTrialSurvey({
      onClose,
    });

  return (
    <div>
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
  );
};

export default VariantModal;
