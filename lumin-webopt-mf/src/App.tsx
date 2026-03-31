import { useEffect } from "react";

import { appEnv } from "@/configs/environment";

import TemplateLibraryDiscover from "./components/TemplateLibraryDiscover";
import withQuery from "./HOC/withQuery";
import withStyles from "./HOC/withStyles";

const AppComponent = () => {
  useEffect(() => {
    console.log(
      `%cLUMIN-WebOptimization-MF Version: ${appEnv.LUMIN_VERSION}`,
      "color:#4CAF50;font-family:system-ui;font-size:15px;font-weight:bold;",
    );
  }, []);

  return <TemplateLibraryDiscover />;
};

const App = withQuery(withStyles(AppComponent));

export default App;
