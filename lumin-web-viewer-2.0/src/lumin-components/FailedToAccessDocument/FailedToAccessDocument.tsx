import classNames from 'classnames';
import { Button, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useNavigate } from 'react-router';

import FailedToAccessDocumentImage from 'assets/images/failed-to-access-document.svg';
import FailedToAccessImage from 'assets/reskin/images/failed-to-access-document.png';

import { ButtonSize } from 'luminComponents/ButtonMaterial';
import { LayoutSecondary } from 'luminComponents/Layout';
import { LayoutSecondary as LayoutSecondaryReskin, styles } from 'luminComponents/ReskinLayout/components/LayoutSecondary';

import { useEnableWebReskin } from 'hooks';

import { Routers } from 'constants/Routers';

import * as Styled from './FailedToAccessDocument.styled';

// Don't need to implement Multilingual for Restrict Lumin access by user information and IP whitelist feature.
export default function FailedToAccessDocument(): JSX.Element {
  const navigate = useNavigate();
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      <LayoutSecondaryReskin>
        <img
          src={FailedToAccessImage}
          alt="failed-to-access-document"
          className={classNames(styles.image, styles.failedToAccessImage)}
        />
        <div>
          <Text type="headline" size="xl" className={styles.title}>Failed to access this document</Text>
          <Text type="body" size="lg">
            The Workspace Admin who owns this document has restricted your access.
          </Text>
        </div>
        <div className={styles.buttonWrapper}>
          <Button size="lg" onClick={() => navigate(Routers.ROOT)}>
            Back to documents
          </Button>
        </div>
      </LayoutSecondaryReskin>
    );
  }

  return (
    <LayoutSecondary footer={false} staticPage>
      <Styled.Container>
        <Styled.ImageContainer>
          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
          <Styled.Image src={FailedToAccessDocumentImage} />
        </Styled.ImageContainer>
        <Styled.Title>Failed to access this document</Styled.Title>
        <Styled.Message>The Workspace Admin who owns this document has restricted your access.</Styled.Message>
        <Styled.ButtonDocument size={ButtonSize.XL} onClick={() => navigate(Routers.ROOT)}>
          Back to documents
        </Styled.ButtonDocument>
      </Styled.Container>
    </LayoutSecondary>
  );
}
