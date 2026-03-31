import { QueryProvider } from "@/libs/react-query";

const withQuery = <T extends object>(
  Component: React.ComponentType<T>,
): React.FC<T> => {
  const HOC = (props: T) => (
    <QueryProvider>
      <Component {...props} />
    </QueryProvider>
  );

  HOC.displayName = `withQuery(${Component.displayName || Component.name})`;

  return HOC;
};

export default withQuery;
