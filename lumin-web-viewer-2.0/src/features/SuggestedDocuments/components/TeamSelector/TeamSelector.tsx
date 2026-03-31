import { Avatar, Icomoon, Text, DynamicSelect } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useGetTeamOptions } from 'features/SuggestedDocuments/hooks';
import { RenderOptionProps, Option } from 'features/SuggestedDocuments/interfaces';

import styles from './TeamSelector.module.scss';

const TeamSelector = () => {
  const dispatch = useDispatch();

  const [selectedValue, setSelectedValue] = useState<Option | null>(null);

  const { options, teams } = useGetTeamOptions();

  const handleSelectTeam = useCallback(
    (option: Option) => {
      dispatch(
        actions.setTeamSelectorData({
          selectedTeam: teams.find((team) => team._id === option.value) || null,
          folderType: option.folderType,
        })
      );
      setSelectedValue(option);
    },
    [teams]
  );

  useEffect(() => {
    if (options.length && !selectedValue) {
      handleSelectTeam(options[0]);
    }
  }, [options, selectedValue, handleSelectTeam]);

  const renderOption = useCallback(
    ({ option, checked = false }: RenderOptionProps) => (
      <div key={option.value} className={styles.optionWrapper}>
        <Avatar size="xs" variant="outline" src={option.avatar} />
        <Text size="md" type="label" color="var(--kiwi-colors-surface-on-surface)">
          {option.label}
        </Text>
        {checked && (
          <Icomoon
            className={styles.optionSelected}
            size="sm"
            type="check-sm"
            color="var(--kiwi-colors-surface-on-surface-variant)"
          />
        )}
      </div>
    ),
    []
  );

  const leftSection = useMemo(
    () => selectedValue && <Avatar size="xs" variant="outline" src={selectedValue.avatar} />,
    [selectedValue]
  );

  const dropdownProps = useMemo(
    () => ({
      classNames: {
        dropdown: styles.dropdown,
      },
    }),
    []
  );

  const optionProps = useMemo(
    () => ({
      classNames: {
        option: styles.option,
      },
    }),
    []
  );

  const onDropdownChange = (value: string | null) => {
    handleSelectTeam(options.find((opt) => opt.value === value) || null);
  };

  return (
    <DynamicSelect
      data={options}
      comboboxProps={{
        width: 260,
        position: 'bottom-end',
      }}
      dropdownProps={dropdownProps}
      optionProps={optionProps}
      leftSection={leftSection}
      renderOption={renderOption}
      onChange={onDropdownChange}
      value={selectedValue?.value || ''}
    />
  );
};

export default TeamSelector;
