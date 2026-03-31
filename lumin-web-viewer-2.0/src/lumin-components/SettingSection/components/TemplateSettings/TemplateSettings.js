import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';

import Switch from 'lumin-components/Shared/Switch';
import Tooltip from 'lumin-components/Shared/Tooltip';
import { toastUtils } from 'utils';
import { useTranslation } from 'hooks';

import Container from '../Container';
import BaseItem from '../BaseItem';

const THROTTLE_TOGGLE_TEMPLATE_VISIBILITY = 500;

function TemplateSettings({
  text,
  tooltip,
  defaultValue,
  onUpdate,
}) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(defaultValue);

  const onChange = useCallback(throttle(async (e) => {
    const { checked: value } = e.target;
    try {
      setChecked(value);
      await onUpdate(value);
    } catch (error) {
      toastUtils.error({
        message: t('teamInsight.failedToUpdateTemplateVisibility'),
      });
      setChecked(!value);
    }
  }, THROTTLE_TOGGLE_TEMPLATE_VISIBILITY), []);

  return (
    <Container title={t('teamInsight.templateSettings')}>
      <BaseItem
        title={t('teamInsight.templateVisibility')}
        text={text}
        rightElement={(
          <Tooltip title={tooltip}>
            <div>
              <Switch
                checked={checked}
                onChange={onChange}
              />
            </div>
          </Tooltip>
        )}
      />
    </Container>
  );
}

TemplateSettings.propTypes = {
  text: PropTypes.string.isRequired,
  tooltip: PropTypes.string.isRequired,
  defaultValue: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default TemplateSettings;
