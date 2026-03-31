import getHashParams from 'helpers/getHashParams';
import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

import packageConfig from '../../package.json';

/* eslint-disable no-console */
export default () => {
  // log UI and Core versions and warn/error if necessary
  const coreVersion = window.Core.getVersion();
  const coreBuild = window.Core.getBuild();
  const uiVersion = packageConfig.version;
  const pdftronServer = !!getHashParams('pdftronServer', null);
  const fullAPI = !!getHashParams('pdfnet', true);
  const disableLogs = getHashParams('disableLogs', false);

  if (disableLogs) {
    return;
  }

  if (coreVersion && uiVersion) {
    // we are using semantic versioning (ie ###.###.###) so the first number is the major version, follow by the minor version, and the patch number
    const [coreMajorVersion, coreMinorVersion] = coreVersion
      .split('.')
      .map((version) => parseInt(version, 10));
    const [uiMajorVersion, uiMinorVersion] = uiVersion
      .split('.')
      .map((version) => parseInt(version, 10));

    if (console.table) {
      const versions = {
        'UI version': uiVersion,
        'Core version': coreVersion,
        Build: coreBuild,
        'WebViewer Server': pdftronServer,
        'Full API': fullAPI,
      };
      console.table(versions);
    } else {
      console.log(
        `[WebViewer] UI version: ${uiVersion}, Core version: ${coreVersion}, Build: ${coreBuild}, WebViewer Server: ${pdftronServer}, Full API: ${fullAPI}`,
      );
    }

    if (coreMajorVersion < uiMajorVersion) {
      logger.logError({
        message: `[WebViewer] Version Mismatch: UI requires Core version ${uiVersion} and above.`,
        reason: LOGGER.Service.PDFTRON,
      });
    } else if (coreMinorVersion < uiMinorVersion) {
      logger.logInfo({
        message: `[WebViewer] Version Mismatch: UI requires Core version ${uiVersion} and above.`,
        reason: LOGGER.Service.PDFTRON,
      });
    }
  }
};
