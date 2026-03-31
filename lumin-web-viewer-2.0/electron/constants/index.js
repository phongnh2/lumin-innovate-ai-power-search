const dialogConstants = require('./dialogConstants');
const errorConstants = require('./errorConstants');
const eventConstants = require('./eventConstants');
const menuConstants = require('./menuConstants');
const oauthConstants = require('./oauthConstants');
const systemConstants = require('./systemConstants');

module.exports = {
  ...eventConstants,
  ...dialogConstants,
  ...menuConstants,
  ...oauthConstants,
  ...systemConstants,
  ...errorConstants,
};
