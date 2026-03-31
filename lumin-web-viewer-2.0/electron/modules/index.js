const { AppManager } = require('./AppManager');
const { IpcHandlers } = require('./IpcHandlers');
const { MenuBuilder } = require('./MenuBuilder');
const { ProtocolHandler } = require('./ProtocolHandler');
const { UpdaterService } = require('./UpdaterService');
const { WindowManager } = require('./WindowManager');
const types = require('../types');

module.exports = {
  AppManager,
  WindowManager,
  ProtocolHandler,
  IpcHandlers,
  MenuBuilder,
  UpdaterService,
  ...types,
};
