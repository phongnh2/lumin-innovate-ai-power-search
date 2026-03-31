import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';

import { Colors } from 'constants/styles';

function PreviewTemplateSkeleton() {
  return (
    <div style={{
      padding: '28px',
    }}
    >
      <Skeleton
        variant="rectangular"
        width={300}
        height={28}
        color={Colors.NEUTRAL_10}
        style={{ marginBottom: 28 }}
      />
      <Skeleton
        variant="rectangular"
        height={650}
        color={Colors.NEUTRAL_10}
        style={{ marginBottom: 18 }}
      />
      <Skeleton
        variant="rectangular"
        height={75}
        color={Colors.NEUTRAL_10}
      />
    </div>
  );
}

export default PreviewTemplateSkeleton;
