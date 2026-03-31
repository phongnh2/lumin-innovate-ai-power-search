import { Icomoon, Text } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DefaultSelect from 'luminComponents/DefaultSelect';

import { useTranslation } from 'hooks';

import { getDocumentSharingPermission } from 'utils';

import { SharingMode } from 'features/ShareInSlack/constants';
import { setAccessLevel, shareInSlackSelectors } from 'features/ShareInSlack/reducer/ShareInSlack.reducer';

import styles from './ShareInSlackForm.module.scss';

type AccessLevelOption = {
  label: string;
  value: string;
  data: {
    icon: string;
  };
};

const AccessLevelSelect = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sharingMode = useSelector(shareInSlackSelectors.getSharingMode);
  const accessLevel = useSelector(shareInSlackSelectors.getAccessLevel);

  const accessLevelOptions = useMemo(() => {
    const options = Object.values(getDocumentSharingPermission(t)).map((option) => ({
      label: option.text ,
      value: option.role,
      data: {
        icon: option.icon,
      },
    }));
    if (sharingMode === SharingMode.ANYONE) {
      options.pop();
    }
    return options;
  }, [sharingMode]);

  const handleSelect = (option: AccessLevelOption) => {
    dispatch(setAccessLevel(option.value));
  };

  const renderOption = ({ option }: { option: AccessLevelOption }) => (
    <div className={styles.optionContainer}>
      <div className={styles.optionInfo}>
        {option.data.icon}
        <Text ellipsis>{option.label}</Text>
      </div>
      {accessLevel === option.value && <Icomoon type="check-sm" size="sm" />}
    </div>
  );

  const leftSection = useMemo(
    () => <Icomoon type={accessLevelOptions.find((option) => option.value === accessLevel)?.data.icon} size="md" />,
    [accessLevel]
  );

  useEffect(() => {
    dispatch(setAccessLevel(accessLevelOptions[0].value));
  }, [accessLevelOptions]);

  useEffect(() => {
    dispatch(setAccessLevel(accessLevelOptions[0].value));
  }, []);

  return (
    <DefaultSelect
      data={accessLevelOptions}
      label={t('shareInSlack.accessLevel')}
      size="lg"
      renderOption={renderOption}
      onChange={(_, option) => handleSelect(option as AccessLevelOption)}
      value={accessLevel}
      leftSection={leftSection}
      classNames={{
        option: styles.option,
        dropdown: styles.dropdown,
      }}
      scrollAreaProps={{
        classNames: {
          viewport: styles.viewport,
        },
      }}
    />
  );
};

export default AccessLevelSelect;
