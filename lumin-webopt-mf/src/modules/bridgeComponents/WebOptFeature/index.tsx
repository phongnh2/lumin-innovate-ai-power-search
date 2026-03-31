import { createBridgeComponent } from "@module-federation/bridge-react";

import TemplateLibraryDiscover from "@/components/TemplateLibraryDiscover";

import withQuery from "@/HOC/withQuery";
import withStyles from "@/HOC/withStyles";

// Force CSS to be included in the remote entry
import "@/styles/app.scss";
import "@/styles/kiwi-css.scss";

const WebOptFeatureBridgeComponent = withQuery(
  withStyles(TemplateLibraryDiscover),
);

const WebOptFeature = createBridgeComponent({
  rootComponent: WebOptFeatureBridgeComponent,
});

export default WebOptFeature;
