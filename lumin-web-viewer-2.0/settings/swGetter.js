/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const crypto = require('crypto');

const caches = [
  {
    cachePath: '/core/webviewer-core.min.js',
    cacheUrl: './lib/core/webviewer-core.min.js',
    fullPath: '/core/webviewer-core.min.[contenthash].js',
  },
  {
    cachePath: '/offline.html',
    cacheUrl: './src/index.offline.html',
    fullPath: '/offline.html',
  },
];

function getEntriesSW() {
  return caches.map(({ cacheUrl, cachePath, fullPath }) => {
    const data = fs.readFileSync(cacheUrl);
    const revision = crypto.createHash('sha1').update(data).digest('hex');

    return { cache: { url: cachePath, revision }, fullPath: fullPath.replace('[contenthash]', revision) };
  });
}

function modifyManifest(buffer) {
  if (process.env.LUMIN_BRANCH === 'pwa') {
    const manifest = JSON.parse(buffer.toString());
  
    manifest['short_name'] = 'Lumin - PWA';
    manifest.name = 'Lumin - PWA';

    return JSON.stringify(manifest, null, 2);
  }

  return buffer;
}

module.exports = {
  getEntriesSW,
  modifyManifest,
};
