import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import core from 'core';

import Menu, { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';
import Divider from 'luminComponents/GeneralLayout/general-components/Divider';

import { useTranslation } from 'hooks';

import { setAnnotationModified } from 'helpers/toggleFormFieldCreationMode';

import { formBuilder } from 'features/DocumentFormBuild';

import * as Styled from '../../FormBuilder.styled';
import FormBuilderContext from '../../formBuilderContext';

const RadioBtnFieldNameContent = ({ displayRadioGroups, handleClosePopover }) => {
  const { t } = useTranslation();
  const { fieldName, setRadioButtonGroups, setFieldName, formFieldAnnotation } = useContext(FormBuilderContext);
  const formFieldCreationManager = core.getFormFieldCreationManager();

  const shouldShowCreateBtn = fieldName && displayRadioGroups.every(({ value }) => value !== fieldName);
  const regex = /^\.|\.$/g;
  const validFieldName = fieldName.trim().replace(regex, '');
  const createNewGroup = (value) => {
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
    setRadioButtonGroups((prevState) => [...prevState, value].sort((a, b) => collator.compare(a, b)));
    const oldFieldName = formFieldAnnotation.fieldName;
    formFieldCreationManager.setFieldName(formFieldAnnotation, value);
    formBuilder.rename(oldFieldName, value);
    setAnnotationModified(true);
    setFieldName(value);

  };

  const renderCreateBtn = () => (
    <>
      <MenuItem blankPrefix onClick={() => createNewGroup(validFieldName)}>
        <Styled.CreateNewGroupBtnContent>
          {t('viewer.formBuildPanel.createName', { name: validFieldName })}
        </Styled.CreateNewGroupBtnContent>
      </MenuItem>
      <Divider />
    </>
  );

  const onClickItem = (value) => {
    const oldFieldName = formFieldAnnotation.fieldName;
    formFieldCreationManager.setFieldName(formFieldAnnotation, value);
    formBuilder.rename(oldFieldName, value);
    setFieldName(value);
    setAnnotationModified(true);
    handleClosePopover();
  };

  return (
    <Menu>
      {shouldShowCreateBtn && renderCreateBtn()}

      <Styled.ScrollWrapper>
        {displayRadioGroups.map((item) => (
          <MenuItem
            key={item.value}
            onClick={() => {
              onClickItem(item.value);
            }}
            icon="md_tick"
            hideIcon={fieldName !== item.value}
          >
            {item.label}
          </MenuItem>
        ))}
      </Styled.ScrollWrapper>
    </Menu>
  );
};

RadioBtnFieldNameContent.propTypes = {
  displayRadioGroups: PropTypes.array.isRequired,
  handleClosePopover: PropTypes.func.isRequired,
};

export default RadioBtnFieldNameContent;
