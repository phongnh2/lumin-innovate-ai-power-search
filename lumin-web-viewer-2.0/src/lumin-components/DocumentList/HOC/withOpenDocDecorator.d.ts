interface Folder {
  _id: string;
}

interface WithOpenDocDecoratorProps {
  folder?: Folder;
}

type GenericFunctionComponent<P> = (props: P) => React.ReactElement;

declare function withOpenDocDecorator<P>(
  WrappedComponent: GenericFunctionComponent<P>
): GenericFunctionComponent<P & WithOpenDocDecoratorProps>;

export default withOpenDocDecorator;
