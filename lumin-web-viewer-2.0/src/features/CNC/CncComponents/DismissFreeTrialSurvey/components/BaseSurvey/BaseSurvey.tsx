/* eslint-disable @typescript-eslint/ban-ts-comment */
import { RadioGroup, FormControlLabel, Radio } from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import ButtonMaterial, { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';
import Icomoon from 'lumin-components/Icomoon';

import { useGetDismissFreeTrialSurveyFlag } from 'features/CNC/hooks';

import stylesModal from './BaseSurveyModal.module.scss';
import stylesPopover from './BaseSurveyPopover.module.scss';

type Props = {
  list: Record<string, string>[];
  selectedItem: string;
  onSelectItem: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
  textareaValue: string;
  onChangeTextarea: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const BaseSurvey = ({
  list,
  selectedItem,
  onSelectItem,
  textareaValue,
  onChangeTextarea,
  onClose,
  onSubmit,
}: Props) => {
  const { isVariantModal, isCloseByButton } = useGetDismissFreeTrialSurveyFlag();
  const styles = isVariantModal ? stylesModal : stylesPopover;

  const renderTextarea = () => {
    if (!selectedItem) {
      return null;
    }

    return (
      <div className={styles.textareaContainer}>
        <p className={styles.labelTextarea}>Might sharing your feedback?</p>
        <textarea
          placeholder="Share some feedback with us"
          value={textareaValue}
          onChange={onChangeTextarea}
          className={styles.textarea}
        />
      </div>
    );
  };

  const renderList = () => (
    <RadioGroup onChange={onSelectItem}>
      {list.map((item, index) => {
        const isChecked = selectedItem === item.value;

        return (
          <FormControlLabel
            key={index}
            checked={isChecked}
            value={item.value}
            control={
              <Radio
                icon={<Icomoon className="md_radio_box_unchecked" size={20} />}
                checkedIcon={<Icomoon className="md_radio_box_checked" size={20} />}
                classes={{
                  root: styles.radio,
                  checked: styles.radioChecked,
                  disabled: styles.radioDisabled,
                }}
              />
            }
            label={item.label}
            disabled={isChecked}
            className={styles.item}
            classes={{
              label: styles.label,
              disabled: styles.labelDisabled,
            }}
          />
        );
      })}
    </RadioGroup>
  );

  return (
    <>
      <p className={styles.title}>Give us another shot</p>
      <p className={styles.description}>
        We would love your feedback, please tell us why you chose to skip the free trial.
      </p>
      <div className={classNames([styles.list, selectedItem && styles.showTextarea])}>
        {renderList()}
        {renderTextarea()}
      </div>
      <div className={classNames([styles.buttonWrapper, isCloseByButton && styles.buttonWrapperDismissByButton])}>
        {isCloseByButton && (
          <ButtonMaterial
            onClick={onClose}
            size={ButtonSize.MD}
            color={ButtonColor.GHOST}
            fullWidth
            classes={{ root: styles.buttonSkip }}
          >
            Skip survey
          </ButtonMaterial>
        )}
        <ButtonMaterial
          onClick={onSubmit}
          size={ButtonSize.MD}
          disabled={!selectedItem}
          fullWidth
          classes={{
            root: styles.buttonSubmit,
            disabled: styles.buttonSubmitDisabled,
          }}
        >
          Submit
        </ButtonMaterial>
      </div>
    </>
  );
};

export default BaseSurvey;
