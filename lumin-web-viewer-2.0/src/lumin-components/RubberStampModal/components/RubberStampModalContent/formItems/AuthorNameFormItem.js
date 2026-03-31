import { Switch, TextInput } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';

import { useTranslation } from 'hooks';

import { RubberStampModalContentContext } from '../RubberStampModalContent';

import * as Styled from './AuthorNameFormItem.styled';

const AuthorNameFormItem = () => {
  const { formData } = useContext(RubberStampModalContentContext);
  const { author, setAuthor, showAuthor, setShowAuthor } = formData;
  const { t } = useTranslation();

  return (
    <Styled.Container data-new-layout data-cy="author_name_form_item">
      <Styled.AuthorSection data-new-layout data-cy="author_section">
        <Styled.Label data-new-layout>{t('viewer.stamp.showYourName')}</Styled.Label>
        <Switch checked={showAuthor} onClick={() => setShowAuthor((preState) => !preState)} wrapperProps={{
          "data-cy": "show_author_name_toggle"
        }}/>
      </Styled.AuthorSection>

      <TextInput
        autoComplete="off"
        value={author}
        onChange={(event) => setAuthor(event.target.value)}
        disabled={!showAuthor}
        size="md"
        wrapperProps={{
          "data-cy": "author_name_input"
        }}
      />
    </Styled.Container>
  );
};

export default AuthorNameFormItem;
