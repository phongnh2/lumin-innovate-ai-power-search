/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React, { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { compose } from 'redux';

import LuminLogo from 'assets/lumin-svgs/logo-lumin.svg';

import CustomHeader from 'luminComponents/CustomHeader';
import PageTitlePortal from 'luminComponents/PortalElement/PageTitlePortal';
import SignLoading from 'luminComponents/SignLoading';

import withRedirectToMyDocumentOnNewPage from 'HOC/withRedirectToMyDocumentOnNewPage';

import { loadRemote } from 'services/moduleFederation';

import styles from './SignDocumentList.module.scss';

type DocumentListProps = {
  variant: string;
  className?: string;
};

const DocumentList = createRemoteAppComponent<DocumentListProps>({
  loader: () => loadRemote('luminsign/DocumentList'),
  // TODO: Add document list skeleton
  // eslint-disable-next-line react/no-unstable-nested-components
  fallback: () => <div>error</div>,
  // TODO: Create Error Component render the fallback and log the error
  loading: <SignLoading loading />,
});

enum UploadButtonVariant {
  B = 'variant-B',
}

function SignDocumentList() {
  const documentListRef = useRef<{ resetRedux: () => void } | null>(null);
  const variant = UploadButtonVariant.B;
  const { orgName } = useParams<{ orgName: string }>();
  const renderUploadButton = () => (
    <Link className={styles.linkContainer} to="/">
      <img className={styles.logo} src={LuminLogo} alt="Lumin logo" />
    </Link>
  );

  useEffect(
    () => () => {
      if (documentListRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        documentListRef.current.resetRedux();
      }
    },
    []
  );

  return (
    <>
      <CustomHeader
        metaTitle="Sign"
        title="Sign"
        description="Streamline client-facing documentation with legally-compliant digital signatures and contract tracking."
      />
      <PageTitlePortal.Element>{renderUploadButton()}</PageTitlePortal.Element>
      {/* @ts-ignore */}
      <DocumentList docRef={documentListRef} variant={variant} className={styles.documentList} orgName={orgName} />
    </>
  );
}

export default compose(withRedirectToMyDocumentOnNewPage)(SignDocumentList);
