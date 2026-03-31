import { Icomoon } from 'lumin-ui/kiwi-ui';
import React, { Dispatch, memo, SetStateAction } from 'react';

import { useTranslation } from 'hooks';

import { SaveDestinationType } from '../../enum';
import { SaveDestinationOptionType } from '../../types';

import styles from './SaveDestinationItem.module.scss';

type Props = SaveDestinationOptionType & {
  setSaveDestination: Dispatch<SetStateAction<SaveDestinationType>>;
};

const SaveDestinationItem = ({ content, contentKey, icon, iconColor, imageSrc, type, setSaveDestination }: Props) => {
  const { t } = useTranslation();

  return (
    <button className={styles.saveDestinationItem} onClick={() => setSaveDestination(type)}>
      {icon && <Icomoon type={icon} color={iconColor} size="lg" />}
      {imageSrc && <img src={imageSrc} alt={content} />}
      {content && <p>{content}</p>}
      {contentKey && <p>{t(contentKey)}</p>}
    </button>
  );
};

export default memo(SaveDestinationItem);
