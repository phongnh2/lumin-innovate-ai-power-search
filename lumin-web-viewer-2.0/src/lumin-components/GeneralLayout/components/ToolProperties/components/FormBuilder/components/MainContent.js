import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { useTranslation } from 'hooks';

import FormFieldDetectionGuideline from 'features/FormFieldDetection/components/FormFieldDetectionGuideline';

import { FORM_FIELD_TYPE } from 'constants/formBuildTool';

import FormBuildCheckbox from './FormBuildCheckbox';
import FormBuildRadioBtn from './FormBuildRadioBtn';
import FormBuildSignature from './FormBuildSignature';
import FormBuildTextField from './FormBuildTextField';
import Properties from './Properties';
import * as Styled from '../FormBuilder.styled';
import { useFormBuilderContext } from '../formBuilderContext';

const MainContent = () => {
  const { tabValue, formFieldAnnotation } = useFormBuilderContext();
  const { t } = useTranslation();

  const [isShowGuideline, setIsShowGuideline] = useState(true);

  const isApplyingFormFieldDetection = useSelector((state) => state.formFieldDetection.isApplyingFormFieldDetection);

  const renderMainContent = ({ tabValue }) => {
    if (!formFieldAnnotation) {
      return null;
    }

    switch (tabValue) {
      case FORM_FIELD_TYPE.TEXT:
        return <FormBuildTextField />;

      case FORM_FIELD_TYPE.CHECKBOX:
        return <FormBuildCheckbox />;

      case FORM_FIELD_TYPE.SIGNATURE:
        return <FormBuildSignature />;

      case FORM_FIELD_TYPE.RADIO:
        return <FormBuildRadioBtn />;

      default:
        return null;
    }
  };

  return (
    <Styled.MainContentWrapper>
      <Styled.MainContentInnerWrapper>
        <Properties />
        {renderMainContent({ tabValue, formFieldAnnotation })}
        {formFieldAnnotation && tabValue && (
          <Styled.Desc>{t('generalLayout.toolProperties.formBuilderDesc')}</Styled.Desc>
        )}
      </Styled.MainContentInnerWrapper>
      {isApplyingFormFieldDetection && isShowGuideline ? (
        <FormFieldDetectionGuideline onClose={() => setIsShowGuideline(false)} />
      ) : null}
    </Styled.MainContentWrapper>
  );
};

export default MainContent;
