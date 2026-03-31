import debounce from 'lodash/debounce';
import { Button, TextInput } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo, useState } from 'react';

import core from 'core';

import { useTranslation } from 'hooks/useTranslation';

import { TIMEOUT } from 'constants/lumin-common';

import useMoveAction from './useMoveAction';

import * as Styled from './MovePanel.styled';

export const MovePanel = () => {
  const { t } = useTranslation();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { movePage, errorMessageFromField, errorMessageToField, setErrorMessageFromField, setErrorMessageToField } =
    useMoveAction();

  const onFromChange = (e) => {
    const _from = parseInt(e.target.value);
    setFrom(Number.isNaN(_from) ? '' : _from);
    setErrorMessageFromField('');
  };

  const onToChange = (e) => {
    const _to = parseInt(e.target.value);
    setTo(Number.isNaN(_to) ? '' : _to);
    setErrorMessageToField('');
  };

  const onKeyDown = (event) => {
    if (event.key.length > 1 || /\d/.test(event.key)) {
      return;
    }
    event.preventDefault();
  };

  useEffect(() => {
    const onPagesUpdated = (changes) => {
      const { added, removed } = changes;
      if (added.length || removed.length) {
        setErrorMessageFromField('');
        setErrorMessageToField('');
      }
    };

    const deboundedOnPagesUpdated = debounce(onPagesUpdated, TIMEOUT.VALIDATE);

    core.docViewer.addEventListener('pagesUpdated', deboundedOnPagesUpdated);
    return () => {
      core.docViewer.removeEventListener('pagesUpdated', deboundedOnPagesUpdated);
    };
  }, []);

  const isDisabled = useMemo(() => !from || !to, [from, to]);

  return (
    <Styled.Wrapper>
      <Styled.Content>
        <Styled.MainContent>
          <Styled.InputContainer>
            <Styled.Label>{t('viewer.leftPanelEditMode.from')}</Styled.Label>
            <TextInput
              onChange={onFromChange}
              onKeyDown={onKeyDown}
              value={from}
              error={errorMessageFromField}
              placeholder={t('message.EGPages', { pages: '1' })}
            />
          </Styled.InputContainer>
          <Styled.InputContainer>
            <Styled.Label>{t('viewer.leftPanelEditMode.to')}</Styled.Label>
            <TextInput
              onChange={onToChange}
              onKeyDown={onKeyDown}
              value={to}
              error={errorMessageToField}
              placeholder={t('message.EGPages', { pages: '2' })}
            />
          </Styled.InputContainer>
        </Styled.MainContent>
      </Styled.Content>

      <Button size="lg" onClick={() => movePage(from, to)} disabled={isDisabled}>
        {t('common.move')}
      </Button>
    </Styled.Wrapper>
  );
};

export default MovePanel;
