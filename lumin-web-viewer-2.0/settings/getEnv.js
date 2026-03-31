/* eslint-disable */
const loadLuminEnviroment = require('./env');
const { getNamespaceEnv } = require('./combineEnv');

let htmlPath = 'src/index.app.dev.html';
let offlineHtmlPath = 'src/index.offline.staging.html';


switch (process.env.LUMIN_BRANCH) {
  case 'viewer':
    htmlPath = 'src/index.app.viewer.html';
    break;
  case 'viewer-staging':
    htmlPath = 'src/index.app.viewer-staging.html';
    break;
  case 'viewer-testing':
    htmlPath = 'src/index.app.viewer-testing.html';
    break;
  case 'cnc':
    htmlPath = 'src/index.app.staging.html';
    break;
  case 'staging':
    htmlPath = 'src/index.app.staging.html';
    break;
  case 'mobile-staging':
    htmlPath = 'src/index.app.staging.html';
    break;
  case 'production':
    htmlPath = 'src/index.app.production.html';
    break;
  default:
    break;
}

const isProd = process.env.NODE_ENV === 'production';
module.exports = {
  env: loadLuminEnviroment(isProd ? getNamespaceEnv(process.env.LUMIN_BRANCH): {}),
  htmlPath: htmlPath,
  offlineHtmlPath,
};
