import { yupResolver } from '@hookform/resolvers/yup';
import { Modal, TextInput, Checkbox } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { Controller, useForm } from 'react-hook-form';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import ModalFooter from 'lumin-components/ModalFooter';
import Input from 'lumin-components/Shared/Input';
import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';

import { useGetFolderType, useTabletMatch, useTranslation } from 'hooks';

import FolderServices from 'services/folderServices';

import { yupUtils as Yup } from 'utils';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { folderType, MAX_LENGTH_DOCUMENT_NAME } from 'constants/documentConstants';
import { FolderType, MAXIMUM_FOLDER_COLOR } from 'constants/folderConstant';
import { ERROR_MESSAGE_DOCUMENT_NAME_LENGTH } from 'constants/messages';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';

import ButtonAddColor from './components/ButtonAddColor';

import * as Styled from './ModalFolder.styled';

import styles from './FolderControllerContent.module.scss';

const ColorPicker = lazyWithRetry(() => import('lumin-components/Shared/ColorPicker'));

FolderControllerContent.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  defaultName: PropTypes.string,
  defaultColor: PropTypes.string,
  type: PropTypes.oneOf(Object.values(FolderType)),
  isShowNotify: PropTypes.bool,
  isEditFolder: PropTypes.bool,
  isEnableReskin: PropTypes.bool,
  title: PropTypes.string,
};

FolderControllerContent.defaultProps = {
  defaultName: '',
  defaultColor: '',
  type: FolderType.PERSONAL,
  isShowNotify: false,
  isEditFolder: false,
  isEnableReskin: false,
  title: '',
};

function FolderControllerContent({
  onSubmit,
  submitLabel,
  onClose,
  defaultName,
  type,
  defaultColor,
  isShowNotify,
  isEditFolder,
  isEnableReskin,
  title,
}) {
  const { t } = useTranslation();
  const folderServices = new FolderServices(type);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const colors = currentUser.metadata.folderColors;

  const inputLabel = t('modalFolder.folderName');

  const schema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .trim()
          .required(t('errorMessage.fieldRequired'))
          .max(
            MAX_LENGTH_DOCUMENT_NAME,
            t(ERROR_MESSAGE_DOCUMENT_NAME_LENGTH.key, { ...ERROR_MESSAGE_DOCUMENT_NAME_LENGTH.interpolation })
          ),
        activeColor: Yup.string(),
        isNotify: Yup.boolean(),
      }),
    []
  );

  const { control, formState, handleSubmit, setValue } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: defaultName,
      activeColor: defaultColor || colors[0],
      isNotify: false,
    },
    resolver: yupResolver(schema),
  });
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const currentFolderType = useGetFolderType();
  const isTabletUp = useTabletMatch();

  const hasReachedMaximumColors = colors.length >= MAXIMUM_FOLDER_COLOR;

  const onColorSelect = (color) => {
    setValue('activeColor', color, { shouldDirty: true });
  };

  const onColorPick = async (color) => {
    await folderServices.addColor(color);
    onColorSelect(color);
  };

  const submit = async ({ name: _name, activeColor, isNotify }) => {
    await onSubmit({ name: _name, activeColor, isNotify });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (formState.isSubmitting) {
      return;
    }
    handleSubmit(submit)(e);
  };

  const renderColors = ({ color, index, active }) => (
    <Styled.ColorItem color={color} onClick={() => onColorSelect(color)} key={index}>
      {active === color && <Icomoon className="check" size={20} />}
    </Styled.ColorItem>
  );

  const renderCheckbox = () => {
    const { totalActiveMember } = currentOrganization;
    const isOrgTab = currentFolderType === folderType.ORGANIZATION;

    if (!isOrgTab || !isShowNotify) {
      return null;
    }

    const label =
      totalActiveMember <= MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION
        ? t('notification.notifyEveryoneThisAction')
        : t('notification.notifyAdminThisAction');

    return (
      <Controller
        control={control}
        name="isNotify"
        render={({ field: { value, onChange } }) =>
          isEnableReskin ? (
            <Checkbox size="md" checked={value} onChange={(event) => onChange(event.target.checked)} label={label} />
          ) : (
            <Styled.CheckBoxWrapper
              control={
                <Styled.CheckBox type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
              }
              label={<Styled.NotifyText>{label}</Styled.NotifyText>}
            />
          )
        }
      />
    );
  };

  const renderFooter = () => {
    const isOrgTab = currentFolderType === folderType.ORGANIZATION;
    if (isEnableReskin && (!isOrgTab || !isShowNotify)) {
      return (
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit(submit)}
          disabled={!formState.isValid || (isEditFolder && !formState.isDirty)}
          loading={formState.isSubmitting}
          label={submitLabel}
        />
      );
    }

    return (
      <Styled.Footer>
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit(submit)}
          disabled={!formState.isValid || (isEditFolder && !formState.isDirty)}
          loading={formState.isSubmitting}
          label={submitLabel}
        />
      </Styled.Footer>
    );
  };

  useEffect(() => {
    if (!isEnableReskin) {
      ColorPicker.preload();
    }
  }, [isEnableReskin]);

  if (isEnableReskin) {
    return (
      <Modal
        opened
        centered
        size="sm"
        cancelButtonProps={{
          title: t('common.cancel'),
        }}
        confirmButtonProps={{
          title: submitLabel,
          type: 'submit',
          disabled: !formState.isValid || (isEditFolder && !formState.isDirty),
        }}
        title={title}
        isProcessing={formState.isSubmitting}
        onConfirm={handleSubmitForm}
        onClose={onClose}
        onCancel={onClose}
      >
        <form onSubmit={handleSubmitForm} className={styles.formContainer}>
          <Controller
            control={control}
            name="name"
            render={({ field: { ref: _ref, ...rest } }) => (
              <TextInput
                autoFocus
                size="lg"
                placeholder={inputLabel}
                error={formState.errors.name?.message}
                autoComplete="off"
                {...rest}
              />
            )}
          />
          {renderCheckbox()}
        </form>
      </Modal>
    );
  }

  return (
    <>
      <Styled.InputWrapper>
        <Controller
          control={control}
          name="name"
          render={({ field: { ref: _ref, ...rest } }) => (
            <Input
              label={inputLabel}
              placeholder={inputLabel}
              autoFocus
              errorMessage={formState.errors.name?.message}
              size={isTabletUp ? InputSize.LARGE : InputSize.SMALL}
              showClearButton
              autoComplete="off"
              {...rest}
            />
          )}
        />
      </Styled.InputWrapper>
      {!isEnableReskin && (
        <>
          <Styled.Label>{t('modalFolder.color')}</Styled.Label>
          <Scrollbars
            autoHide
            autoHeight
            autoHeightMax={isTabletUp ? 200 : 180}
            style={{ margin: '0 -6px', width: 'calc(100% + 12px)' }}
          >
            <Styled.ColorWrapper>
              <ButtonAddColor hasReachedMaximumColors={hasReachedMaximumColors} onColorPick={onColorPick} />
              <Controller
                control={control}
                name="activeColor"
                render={({ field: { value } }) =>
                  colors.map((color, index) =>
                    renderColors({
                      color,
                      index,
                      active: value,
                    })
                  )
                }
              />
            </Styled.ColorWrapper>
          </Scrollbars>
        </>
      )}

      {renderCheckbox()}
      {renderFooter()}
    </>
  );
}

export default FolderControllerContent;
