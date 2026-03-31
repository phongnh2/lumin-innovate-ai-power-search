import { Button } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import useToolProperties from '@new-ui/hooks/useToolProperties';

import { useTranslation } from 'hooks';

import { formBuilder } from 'features/DocumentFormBuild';

import * as Styled from '../FormBuilder.styled';
import FormBuilderContext from '../formBuilderContext';

export const Footer = () => {
  const { t } = useTranslation();
  const { toggleFormBuildTool } = useToolProperties();
  const { applyFormFields, isValid } = useContext(FormBuilderContext);

  return (
    <Styled.FooterWrapper>
      <Button
        className="children-btn"
        size="lg"
        variant="outlined"
        onClick={() => {
          formBuilder.reset();
          toggleFormBuildTool();
        }}
      >
        {t('action.cancel')}
      </Button>

      <Button className="children-btn" size="lg" variant="filled" onClick={applyFormFields} disabled={!isValid}>
        {t('action.apply')}
      </Button>
    </Styled.FooterWrapper>
  );
};

export default Footer;
