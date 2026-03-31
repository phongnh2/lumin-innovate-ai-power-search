/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React from 'react';
import { Trans } from 'react-i18next';

import Icomoon from 'luminComponents/Icomoon';
import InfiniteScroll from 'luminComponents/InfiniteScroll';
import Tooltip from 'luminComponents/Shared/Tooltip/Tooltip';

import { useTranslation } from 'hooks';

import { toastUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { formFieldAutocompleteBase } from 'features/FormFieldAutosuggestion';
import { FormFieldSuggestion } from 'features/FormFieldAutosuggestion/types';

import { Colors } from 'constants/styles';

import * as Styled from './AutoCompleteSection.styled';

const updateSelectedList = ({ list, key, remove }: { list: string[]; key: string; remove?: boolean }): string[] => {
  const itemIndex = list.findIndex((item) => item === key);
  if (itemIndex !== -1) {
    const updatedList = [...list];
    updatedList.splice(itemIndex, 1);
    return updatedList;
  }
  return remove ? list : [key, ...list];
};

interface Props {
  entries: FormFieldSuggestion[];
  setEntryList: () => Promise<void>;
  selectedEntryList: string[];
  setSelectedEntryList: (value: React.SetStateAction<string[]>) => void;
}

function EntryList(props: Props): JSX.Element {
  const { t } = useTranslation();
  const { entries, setEntryList, selectedEntryList, setSelectedEntryList } = props;
  const deleteEntry = (key: string): void => {
    formFieldAutocompleteBase.delete(key);
    toastUtils.success({ message: t('settingGeneral.toastDeleteEntry') });
    setEntryList();
    setSelectedEntryList((prev: string[]) => updateSelectedList({ list: prev, key, remove: true }));
  };

  const onChangeCheckbox = (content: string): void => {
    setSelectedEntryList((prev: string[]) => updateSelectedList({ list: prev, key: content }));
  };

  return entries.length ? (
    <Styled.EntryList>
      <InfiniteScroll autoHeight autoHeightMin={0} autoHeightMax={264} hasNextPage={false} onLoadMore={() => {}}>
        {entries.map((entry: FormFieldSuggestion) => (
          <Styled.Entry key={entry.content}>
            <Styled.CheckBox
              // @ts-ignore
              checked={selectedEntryList.findIndex((item) => item === entry.content) !== -1}
              type="checkbox"
              onChange={() => onChangeCheckbox(entry.content)}
              disableRipple
            />
            <Tooltip title={entry.content} tooltipStyle={{ maxWidth: 500 }} placement="bottom">
              <Styled.EntryContent>{entry.content}</Styled.EntryContent>
            </Tooltip>
            <Styled.Trash
              onClick={() => deleteEntry(entry.content)}
              data-lumin-btn-name={ButtonName.REMOVE_AUTO_COMPLETE_ENTRY}
            >
              <Icomoon className="trash" size={18} color={Colors.NEUTRAL_60} />
            </Styled.Trash>
          </Styled.Entry>
        ))}
      </InfiniteScroll>
    </Styled.EntryList>
  ) : (
    <Styled.EmptyList>
      <Styled.EmptyMessage>
        <Trans
          i18nKey="settingGeneral.emptyEntryList"
          components={{
            Link: (
              <Styled.LearnMoreLink
                href="https://www.luminpdf.com/blog/how-to-create-a-fillable-pdf-with-lumin/"
                target="_blank"
              />
            ),
          }}
        />
      </Styled.EmptyMessage>
    </Styled.EmptyList>
  );
}

export default EntryList;
