import { TextInput } from 'lumin-ui/kiwi-ui';
import React, { useContext, useEffect, useState } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { RubberStampModalContentContext } from '../RubberStampModalContent';

import * as Styled from './TitleFormItem.styled';

const STAMP_TEXT_LENGTH_MAXIMUM = 254;

const TitleFormItem = () => {
  const { formData } = useContext(RubberStampModalContentContext);
  const { t } = useTranslation();
  const { title, setTitle, setDisabledCreateBtn } = formData;
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const titleLength = title.trim().length;
    let message = '';
    if (titleLength <= 0) {
      message = t('viewer.stamp.stampTextEmpty');
    } else if (titleLength > STAMP_TEXT_LENGTH_MAXIMUM) {
      message = t('viewer.stamp.stampTextReachLimit', { number: STAMP_TEXT_LENGTH_MAXIMUM });
    }
    setErrorMessage(message);
    setDisabledCreateBtn(Boolean(message));
  }, [title]);

  return (
    <Styled.ItemWrapper data-new-layout>
      <TextInput
        label={<Styled.Label>{t('viewer.stamp.content')}</Styled.Label>}
        autoComplete="off"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        size="md"
      />
      <span className="error-message">{errorMessage}</span>
    </Styled.ItemWrapper>
  );
};

export default TitleFormItem;
