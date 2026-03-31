import { BASEURL, CORE_VERSION } from 'constants/urls';

const isElectronBrowser = () => window && window.navigator.userAgent.includes('Electron');

export const isElectron = () =>
  (typeof window !== 'undefined' && window.electronAPI?.isElectron) || isElectronBrowser();

export const getCorePath = async () => {
  if (isElectron() && window.electronAPI?.getCorePath) {
    try {
      return await window.electronAPI.getCorePath();
    } catch (error) {
      console.warn('Failed to get core path from Electron, falling back to default:', error);
    }
  }
  return `/${CORE_VERSION}/core/`;
};

export const getResourcesPath = async () => {
  const corePath = await getCorePath();
  return `${corePath}assets/`;
};

export const getFontPath = async () => {
  const corePath = await getCorePath();
  return `${corePath}font/`;
};

export const getPDFNetPath = async () => {
  const corePath = await getCorePath();
  return `${corePath}pdf/PDFNet.js`;
};

export const getAllResourcePaths = async () => {
  if (isElectron() && window.electronAPI?.getResourcePaths) {
    try {
      return await window.electronAPI.getResourcePaths();
    } catch (error) {
      console.warn('Failed to get resource paths from Electron, falling back to defaults:', error);
    }
  }

  // Fallback for web environment
  return {
    core: `/${CORE_VERSION}/core/`,
    assets: `/${CORE_VERSION}/core/assets/`,
    i18n: `/i18n/`,
    font: `${BASEURL}/${CORE_VERSION}/core/font/`,
  };
};

export const setWebViewerPaths = async (CoreControls: typeof Core) => {
  const paths = await getAllResourcePaths();

  CoreControls.setWorkerPath(paths.core);
  CoreControls.setResourcesPath(paths.assets || `${paths.core}assets`);

  if (paths.font) {
    CoreControls.setCustomFontURL(paths.font);
  }
};

export default {
  getCorePath,
  getResourcesPath,
  getFontPath,
  getPDFNetPath,
  getAllResourcePaths,
  setWebViewerPaths,
  isElectron,
};
