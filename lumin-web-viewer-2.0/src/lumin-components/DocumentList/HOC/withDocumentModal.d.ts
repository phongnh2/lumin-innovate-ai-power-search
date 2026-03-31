import { IDocumentBase } from 'interfaces/document/document.interface';

interface WithDocumentModalProps {
  refetchDocument: () => void;
}

export interface ExtendedDocumentModalProps {
  openDocumentModal: React.Dispatch<
    React.SetStateAction<{
      mode: string;
      selectedDocuments: IDocumentBase[];
    }>
  >;
}

type GenericFunctionComponent<P> = (props: P) => React.ReactElement;

declare function withDocumentModal<P>(
  WrappedComponent: GenericFunctionComponent<P>
): GenericFunctionComponent<Omit<P & WithDocumentModalProps, keyof ExtendedDocumentModalProps>>;

export default withDocumentModal;
