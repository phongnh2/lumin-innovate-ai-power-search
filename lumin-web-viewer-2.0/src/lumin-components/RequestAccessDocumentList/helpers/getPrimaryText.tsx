import { capitalize } from 'lodash';
import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import { RequestPermissionText, TRequestPermission } from '../constants';
import * as Styled from '../RequestAccessDocumentList.styled';

const getPrimaryText = ({
  name,
  requestedPermission = RequestPermissionText.SHARER,
  isReskin = false,
}: {
  name: string;
  requestedPermission: TRequestPermission;
  isReskin?: boolean;
}): JSX.Element => {
  if (isReskin) {
    return (
      <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)" component="label">
        <Trans
          i18nKey="modalShare.headerRequestList"
          values={{ name, requestedPermission: capitalize(requestedPermission) }}
          components={{
            b: <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)" component="span" />,
          }}
        />
      </Text>
    );
  }

  return (
    <Styled.Title>
      <Trans
        i18nKey="modalShare.headerRequestList"
        values={{ name, requestedPermission: capitalize(requestedPermission) }}
        components={{ b: <b /> }}
      />
    </Styled.Title>
  );
};

export { getPrimaryText };
