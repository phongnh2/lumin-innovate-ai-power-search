import React, { useContext } from 'react';

import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks';

import { FORM_BUILD_LABEL_MAPPING } from 'constants/formBuildTool';

import * as Styled from '../FormBuilder.styled';
import FormBuilderContext from '../formBuilderContext';

const Properties = () => {
  const { tabValue, formFieldAnnotation } = useContext(FormBuilderContext);
  const { t } = useTranslation();

  const renderProperties = ({ tabValue, formFieldAnnotation }) => {
    if (!tabValue || !formFieldAnnotation) {
      return <Styled.NoProperties>{t('viewer.formBuildPanel.noFieldIsSelected')}</Styled.NoProperties>;
    }

    return (
      <Styled.PropertiesContent>
        <Icomoon className={FORM_BUILD_LABEL_MAPPING[tabValue].newIcon} size={22} />
        {t(FORM_BUILD_LABEL_MAPPING[tabValue].label)}
      </Styled.PropertiesContent>
    );
  };

  return (
    <Styled.BaseSection>
      <Styled.PropertiesLabel>{t('viewer.formBuildPanel.properties')}</Styled.PropertiesLabel>
      {renderProperties({ tabValue, formFieldAnnotation })}
    </Styled.BaseSection>
  );
};

export default Properties;
