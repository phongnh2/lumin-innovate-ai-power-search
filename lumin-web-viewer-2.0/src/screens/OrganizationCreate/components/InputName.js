import React, { useContext } from 'react';

import { TextInput } from 'luminComponents/ReskinLayout/components/TextInput';
import Input from 'luminComponents/Shared/Input';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { validator } from 'utils';
import { FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';

import { OrganizationCreateContext } from '../OrganizationCreate.context';
import { StyledItem, StyledItemLabelWrapper, StyledInputLabel, StyledItemContent } from '../OrganizationCreate.styled';

const InputName = () => {
  const { state, setState } = useContext(OrganizationCreateContext);
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const changeOrgName = (event) => {
    const targetValue = event.currentTarget.value;
    const trimName = targetValue.trim();
    setState({ organizationName: targetValue, organizationNameError: validator.validateOrgName(trimName) });
  };

  const handleBlur = (event) => {
    const targetValue = event.currentTarget.value;
    const trimName = targetValue.trim();
    if (trimName.length > 0) {
      setState({ updatedWorkspaceName: true });
    }
    setState({ organizationName: targetValue, organizationNameError: validator.validateOrgName(trimName) });
  };

  if (isEnableReskin) {
    return (
      <TextInput
        name={FORM_INPUT_NAME.ORGANIZATION_NAME}
        onChange={changeOrgName}
        placeholder={t('common.eg', { egText: 'Lumin PDF' })}
        value={state.organizationName}
        error={state.organizationNameError}
        disabled={state.isCreating}
        size="lg"
        label={t('createOrg.name')}
        onBlur={handleBlur}
      />
    );
  }

  return (
    <StyledItem>
      <StyledItemLabelWrapper>
        <StyledInputLabel>{t('createOrg.orgName')}</StyledInputLabel>
      </StyledItemLabelWrapper>
      <StyledItemContent>
        <Input
          name={FORM_INPUT_NAME.ORGANIZATION_NAME}
          onChange={changeOrgName}
          placeholder={t('common.eg', { egText: 'Lumin PDF' })}
          value={state.organizationName}
          errorMessage={state.organizationNameError}
          onBlur={changeOrgName}
          showClearButton
          hideValidationIcon
          disabled={state.isCreating}
        />
      </StyledItemContent>
    </StyledItem>
  );
};

export default InputName;
