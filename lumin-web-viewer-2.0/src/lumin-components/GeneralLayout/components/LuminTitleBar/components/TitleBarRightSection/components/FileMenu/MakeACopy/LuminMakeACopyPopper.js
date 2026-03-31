import { PlainTooltip, Radio, RadioGroup } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { DocumentStorage } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

import styles from './LuminMakeACopyPopper.module.scss';

const propTypes = {
  syncFileTo: PropTypes.string,
  typeOfStorage: PropTypes.string,
  handleChangeSyncDestination: PropTypes.func,
  disabledLuminStorage: PropTypes.bool.isRequired,
};

const externalStorages = [STORAGE_TYPE.GOOGLE, STORAGE_TYPE.ONEDRIVE, STORAGE_TYPE.DROPBOX];

const LuminMakeACopyPopper = (props) => {
  const { syncFileTo = '', typeOfStorage, handleChangeSyncDestination = () => {}, disabledLuminStorage } = props;
  const { t } = useTranslation();

  const disabledStorage = (storage) => externalStorages.filter((item) => storage !== item).includes(typeOfStorage);

  return (
    <RadioGroup name="sync-destination" value={syncFileTo} onChange={handleChangeSyncDestination}>
      <div className={styles.container}>
        <PlainTooltip
          content={disabledLuminStorage && t('modalMakeACopy.featureUnavailable')}
          disabled={!disabledLuminStorage}
          position="right"
        >
          <span>
            <Radio value={STORAGE_TYPE.S3} label={DocumentStorage.S3} disabled={disabledLuminStorage} />
          </span>
        </PlainTooltip>
        <Radio
          value={STORAGE_TYPE.GOOGLE}
          label={DocumentStorage.GOOGLE}
          disabled={disabledStorage(STORAGE_TYPE.GOOGLE)}
        />
        <Radio
          value={STORAGE_TYPE.ONEDRIVE}
          label={DocumentStorage.ONEDRIVE}
          disabled={disabledStorage(STORAGE_TYPE.ONEDRIVE)}
        />
        <Radio
          value={STORAGE_TYPE.DROPBOX}
          label={DocumentStorage.DROPBOX}
          disabled={disabledStorage(STORAGE_TYPE.DROPBOX)}
        />
      </div>
    </RadioGroup>
  );
};

LuminMakeACopyPopper.propTypes = propTypes;

export default LuminMakeACopyPopper;
