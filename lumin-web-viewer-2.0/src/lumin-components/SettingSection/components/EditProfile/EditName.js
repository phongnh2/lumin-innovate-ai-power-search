import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Input from 'lumin-components/Shared/Input';

import { useTabletMatch, useTranslation } from 'hooks';

import { getErrorMessageTranslated, toastUtils } from 'utils';
import Yup, { yupValidator } from 'utils/yup';

import { ModalTypes } from 'constants/lumin-common';

import * as Styled from './EditName.styled';

function EditName({
  title,
  placeholder,
  defaultName,
  onEditName,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  const schema = useMemo(
    () =>
      Yup.object().shape({
        name: yupValidator().organizationName,
      }),
    []
  );

  const {
    control, formState, handleSubmit, reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: defaultName,
    },
    resolver: yupResolver(schema),
  });
  const isTabletUp = useTabletMatch();
  const [isEditMode, setEditMode] = useState(false);

  const onSubmit = async (value) => {
    try {
      const newName = value.name.trim();
      await onEditName(newName);
      setEditMode(false);
      reset({
        name: newName,
      });
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('common.updateSuccessfully'),
      });
    } catch (e) {
      toastUtils.openToastMulti({
        type: ModalTypes.ERROR,
        message: t('teamInsight.failedToUpdate'),
      });
    }
  };

  const onCancel = () => {
    reset();
    setEditMode(false);
  };

  const changeNameButton = useMemo(() => (
    <Styled.ChangeName
      size={ButtonSize.XS}
      color={ButtonColor.HYPERLINK}
      onClick={() => setEditMode(true)}
    >
      {t('teamInsight.changeName')}
    </Styled.ChangeName>
  ), []);

  useEffect(() => {
    if (isEditMode) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  const { isDirty, isSubmitting, isValid } = formState;

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.Title>
          {title}
        </Styled.Title>
        {!isTabletUp && !isEditMode && changeNameButton}
      </Styled.Header>
      <Styled.Form onSubmit={handleSubmit(onSubmit)}>
        <Styled.InputWrapper>
          <Controller
            control={control}
            name="name"
            render={(({ field: { ref: _ref, ...rest }, fieldState }) => (
              <Input
                {...rest}
                placeholder={placeholder}
                disabled={!isEditMode}
                errorMessage={getErrorMessageTranslated(fieldState?.error?.message)}
                autoFocus
                showClearButton
                ref={inputRef}
              />
            ))}
          />
          {isEditMode && (
            <Styled.GroupButton>
              <ButtonMaterial
                fullWidth
                size={ButtonSize.XL}
                color={ButtonColor.TERTIARY}
                onClick={onCancel}
              >
                {t('common.cancel')}
              </ButtonMaterial>
              <ButtonMaterial
                fullWidth
                size={ButtonSize.XL}
                type="submit"
                disabled={!isDirty || isSubmitting || !isValid}
              >
                {t('common.update')}
              </ButtonMaterial>
            </Styled.GroupButton>
          )}
        </Styled.InputWrapper>
        {isTabletUp && !isEditMode && changeNameButton}
      </Styled.Form>
    </Styled.Container>
  );
}

EditName.propTypes = {
  title: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  defaultName: PropTypes.string.isRequired,
  onEditName: PropTypes.func.isRequired,
};

export default EditName;
