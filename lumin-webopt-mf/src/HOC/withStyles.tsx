import "@/styles/app.scss";
import "../styles/kiwi-css.scss";

const WEBOPT_PREFIX = process.env.LUMIN_WEBOPT_PREFIX;

const withStyles = <T extends object>(
  Component: React.ComponentType<T>,
): React.FC<T> => {
  const HOC = (props: T) => (
    <div id={WEBOPT_PREFIX} style={{ width: "100%", height: "100%" }}>
      <div className="base">
        <Component {...props} />
      </div>
    </div>
  );

  HOC.displayName = `withStyles(${Component.displayName || Component.name})`;

  return HOC;
};

export default withStyles;
