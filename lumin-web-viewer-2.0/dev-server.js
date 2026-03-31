/* eslint-disable */
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const opn = require('opn');
const config = require('./webpack.config.dev');
const { version: coreVersion } = require('./lib/package.json');


const app = express();
const compiler = webpack(config);

app.use(devMiddleware(compiler, {
  publicPath: config.output.publicPath,
}));
app.use(hotMiddleware(compiler));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use('/i18n', express.static(path.resolve(__dirname, 'i18n')));
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));
app.use(`/${coreVersion}/core`, express.static(path.resolve(__dirname, 'lib/core'), {index: false}));
// Handle 404 for unmatched static files
app.use(`/${coreVersion}/core`, (req, res, next) => {
  res.status(404).send('File not found');
});
app.use('/js', express.static(path.resolve(__dirname, 'js')));
app.use('/unzip', express.static(path.resolve(__dirname, 'unzip')));

app.get('/core/webviewer-core.min.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'lib/core/webviewer-core.min.js'));
});

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'manifest.json'));
});

app.get('/mf-manifest.json', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build/mf-manifest.json'));
});

app.get('/source.zip', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'source.zip'));
});

app.get('/sw.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'sw.js'));
});

app.get('/offline/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'src/index.offline.html'));
});

app.get('/sample-url', (req, res) => {
  res.redirect('/#d=https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf&a=1');
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'src/index.app.html'));
});


app.listen(3000, '0.0.0.0', (err) => {
  if (err) {
    console.error(err);
  } else {
    console.info(`Listening at localhost:3000`);
    opn('http://localhost:3000');
  }
});
