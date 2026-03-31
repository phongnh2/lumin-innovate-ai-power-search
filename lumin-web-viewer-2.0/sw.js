/* eslint-disable */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');
// importScripts('./unzip/unzipit.min.js');

const TRIGGERED_FLAG = '757edc7211609f0095cc04805f384442dce60ff8fcf9defd7b2fad0518599158';

/**
 * To force update service worker:
 *  - Change the value of REVISION_SEARCH_PARAM below
 *  - Update SERVICE_WORKER_VERSION in constants/serviceWorker.ts
 */
const REVISION_SEARCH_PARAM = '__LUMIN_REVISION_2.2__';

const infoTbl = 'ProfileData';
const cachesTbl = 'DocumentCaches';
const cmdTbl = 'DocumentCommands';
const cloudTbl = 'DocumentClouds';
const cmdTmpTbl = 'DocumentTempCommands';

const TABLES = {
  SYSTEM_DOCUMENTS: 'DocumentSystems',
  INFO: 'ProfileData',
  CLOUD_DOCUMENTS: 'DocumentClouds',
  DOCUMENTS_CACHING: 'DocumentCaches',
  DOCUMENT_COMMANDS: 'DocumentCommands',
  DOCUMENT_TEMP_COMMANDS: 'DocumentTempCommands',
  DOCUMENT_OFFLINE_EVENTS: 'DocumentOfflineTrackingEvents',
  FREQUENTLY_USED_DOCUMENTS_CACHING: 'FrequentlyUsedDocumentCaches',
  FORM_FIELD_SUGGESTIONS: 'FormFieldSuggestions',
  TEMP_EDIT_MODE_FILE_CHANGED: 'TempEditModeFileChanged',
  AUTO_DETECT_FORM_FIELDS: 'AutoDetectFormFields',
  GUEST_MODE_MANIPULATE_DOCUMENTS: 'GuestModeManipulateDocuments',
};

const database = {
  name: 'LuminDocs',
};

const MAX_CHANGED_TO_UPDATE = 9999;

function openDb() {
  const dbVersion = new URL(location).searchParams.get('dbVersion');
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(database.name, dbVersion);
    req.onupgradeneeded = () => {
      Object.values(TABLES).forEach((value) => {
        if (!req.result.objectStoreNames.contains(value)) {
          [
            TABLES.INFO,
            TABLES.DOCUMENT_OFFLINE_EVENTS,
            TABLES.FORM_FIELD_SUGGESTIONS,
            TABLES.TEMP_EDIT_MODE_FILE_CHANGED,
            TABLES.AUTO_DETECT_FORM_FIELDS,
          ].includes(value)
            ? req.result.createObjectStore(value)
            : req.result.createObjectStore(value, { keyPath: '_id' });
        }
      });
    };
    req.onsuccess = function (event) {
      const db = event.target.result;
      db.onversionchange = () => {
        db.close();
      };
      resolve(db);
    };

    req.onerror = function (event) {
      reject(event.target.error);
    };
  });
}

let hasRetry = false;

async function openDbPromise() {
  let hasRetry = false;
  try {
    return await openDb();
  } catch (err) {
    console.error(err);
    switch (err.name) {
      case 'VersionError':
      case 'QuotaExceededError': {
        await deleteDB(database.name);
        if (!hasRetry) {
          hasRetry = true;
          return await openDb();
        }
      }
      default:
        throw err;
    }
  }
}

function getObjectStore(dbIns, tbl) {
  return dbIns.transaction(tbl, 'readwrite').objectStore(tbl);
}

function getRecord(objStore, key) {
  return new Promise((resolve) => {
    const getRequest = objStore.get(key);
    getRequest.onsuccess = () => {
      resolve(getRequest.result);
    };
  });
}

function createCacheKey(entry) {
  const { revision, url } = entry;

  if (!revision) {
    const urlObject = new URL(url, location.href);
    return {
      cacheKey: urlObject.href,
      url: urlObject.href,
      path: url,
    };
  }

  const cacheKeyURL = new URL(url, location.href);
  const originalURL = new URL(url, location.href);
  cacheKeyURL.searchParams.set(REVISION_SEARCH_PARAM, revision);
  return {
    cacheKey: cacheKeyURL.href,
    url: originalURL.href,
    path: url,
  };
}

function notifyToAllClients(msg, clientId) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      msg = { ...msg, initiator: client.id === clientId };
      client.postMessage(msg);
    });
  });
}

function prevDownload({ action, clientId, status }) {
  openDbPromise().then((instance) => {
    getObjectStore(instance, infoTbl).put(true, 'offline_processing');
    notifyToAllClients(
      {
        process: {
          success: true,
          action,
          status,
        },
      },
      clientId
    );
  });
}

function finishedDownload({ action, clientId = '', status = 'ok', ...rest }) {
  openDbPromise().then((instance) => {
    getObjectStore(instance, infoTbl).delete('offline_processing');
    getObjectStore(instance, infoTbl).delete('is_caching');
    notifyToAllClients(
      {
        process: {
          success: true,
          action,
          status,
          ...rest,
        },
      },
      clientId
    );
  });
}

function abortCaching(clientId = '') {
  openDbPromise().then((instance) => {
    getObjectStore(instance, infoTbl).delete('offline_processing');
    getObjectStore(instance, infoTbl).delete('is_caching');
    getObjectStore(instance, infoTbl).clear();
    notifyToAllClients(
      {
        process: {
          success: true,
          action: '',
          status: 'abort',
        },
      },
      clientId
    );
  });
}

// async function getSource() {
//   const response = await fetch('/source.zip');
//   const reader = response.body.getReader();
//   const contentLength = +response.headers.get('Content-Length');
//   let receivedLength = 0;
//   const chunks = [];
//   while(true) {
//     const {done, value} = await reader.read();

//     if (done) {
//       break;
//     }

//     chunks.push(value);
//     receivedLength += value.length;

//     notifyToAllClients(
//       {
//         process: {
//           action: 'source_downloading',
//           success: true,
//           status: 'pending',
//           contentLength,
//           downloadedLength: receivedLength,
//         }
//       },
//     )
//   }

//   return new Blob(chunks);
// }

const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);

  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

const extensions = {
  svg: 'image/svg+xml',
  js: 'application/javascript',
  wasm: 'application/wasm',
  css: 'text/css',
  html: 'text/html',
  json: 'application/json',
  res: 'application/x-dtbresource+xml',
  ico: 'image/x-icon',
};

const mappingExtensions = (url = '') => {
  const ext = url.split('.').pop();
  if (ext === url || !ext) return 'application/octet-stream';
  return extensions[ext] || 'application/octet-stream';
};

const getDefaultHeader = async (cache) => {
  const response = await cache.match('/offline.html', { ignoreSearch: true });
  return response
    ? {
        'content-security-policy': response.headers.get('content-security-policy'),
        'cf-cache-status': 'DYNAMIC',
        server: 'cloudflare',
        'x-frame-options': 'SAMEORIGIN',
      }
    : {};
};

if (workbox) {
  workbox.core.setCacheNameDetails({
    prefix: 'lumin',
  });
  workbox.core.clientsClaim();
  workbox.core.skipWaiting();

  workbox.precaching.cleanupOutdatedCaches();

  const [precacheUrls, subsequentPrecacheUrls] = (self.__WB_MANIFEST || []).reduce(
    ([precacheAcc, subsequentPrecacheAcc], value) => {
      if (value.url.includes('/core/webviewer-core.min.js')) {
        return [[...precacheAcc, value], subsequentPrecacheAcc];
      }

      return [precacheAcc, [...subsequentPrecacheAcc, value]];
    },
    [[], []]
  );

  const sourceRouteUrls = subsequentPrecacheUrls.map((entry) => createCacheKey(entry));

  const precacheController = new workbox.precaching.PrecacheController();

  precacheController.addToCacheList(precacheUrls);

  self.addEventListener('install', (event) => {
    event.waitUntil(precacheController.install(event));
    openDbPromise()
      .then(async (instance) => {
        const offlineProcessing = await getRecord(getObjectStore(instance, infoTbl), 'offline_processing');
        const isCachingProcess = await getRecord(getObjectStore(instance, infoTbl), 'is_caching');
        if (isCachingProcess) {
          abortCaching();
        } else if (offlineProcessing) {
          getObjectStore(instance, infoTbl).delete('offline_processing');
        }
      })
      .catch((err) => {
        console.error('Error on install sw.js: ' + err.message);
      });
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(precacheController.activate(event));
  });

  const cachedResponseWillBeUsed = ({ request, cachedResponse }, { ignoreSearch } = { ignoreSearch: false }) => {
    if (cachedResponse) {
      return cachedResponse;
    }

    const { cacheKey } = sourceRouteUrls.find(({ url: originalUrl }) => originalUrl === request.url) || {};
    return caches.match(cacheKey || request.url, { ignoreSearch });
  };

  const useCacheKeyUrl = ({ request }) => {
    if (request.url.includes('/core/')) {
      const { cacheKey } = sourceRouteUrls.find(({ url: originalUrl }) => originalUrl === request.url) || {};
      return cacheKey ? new Request(cacheKey, request) : request;
    }

    return request;
  };

  const ignoreQueryStringPlugin = {
    cachedResponseWillBeUsed: ({ request, cachedResponse }) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.match(request.url, { ignoreSearch: true });
    },
  };

  workbox.routing.registerRoute(
    new RegExp('/icomoon.*'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'lumin-network-prior',
    })
  );

  workbox.routing.registerRoute(
    new RegExp('/_mf/ag/mf-manifest.json'),
    new workbox.strategies.NetworkOnly()
  );

  workbox.routing.registerRoute(
    new RegExp('/manifest.json'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'lumin-network-prior',
    })
  );

  workbox.routing.registerRoute(
    new RegExp(/\/i18n\/.*/),
    new workbox.strategies.NetworkFirst({
      cacheName: 'lumin-network-prior',
    })
  );

  workbox.routing.registerRoute(
    new RegExp(/\/fonts\/(?!icomoon).*/),
    new workbox.strategies.CacheFirst({
      cacheName: 'lumin-font',
    })
  );

  workbox.routing.registerRoute(
    new RegExp(/\/assets\/images\/.*/),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'lumin-static',
    })
  );

  workbox.routing.registerRoute(
    new RegExp('https://s3\\.amazonaws\\.com/.*/thumbnails/.*'),
    new workbox.strategies.CacheFirst({
      cacheName: 'lumin-files',
      plugins: [ignoreQueryStringPlugin],
    })
  );
  workbox.routing.registerRoute(
    new RegExp('https://.*\\.s3\\.amazonaws\\.com/annotation-image/.*'),
    new workbox.strategies.CacheFirst({
      cacheName: 'lumin-files',
      plugins: [ignoreQueryStringPlugin],
    })
  );

  workbox.routing.registerRoute(
    new RegExp(/\/core\/*/),
    new workbox.strategies.CacheFirst({
      cacheName: 'lumin-source',
      plugins: [
        {
          cacheKeyWillBeUsed: useCacheKeyUrl,
          requestWillFetch: useCacheKeyUrl,
        },
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ url }) => Boolean(sourceRouteUrls.find(({ path: originalPath }) => originalPath === url.pathname)),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'lumin-source',
      plugins: [{ cachedResponseWillBeUsed }],
    })
  );

  workbox.routing.registerRoute(
    new RegExp(/\/.*.js|\/.*.css|\/.*.svg/),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'lumin-source',
      plugins: [{ cachedResponseWillBeUsed: (...args) => cachedResponseWillBeUsed(...args, { ignoreSearch: true }) }],
    })
  );

  workbox.routing.registerRoute(
    new RegExp('https://www.pdftron.com/webfonts/.*'),
    new workbox.strategies.CacheFirst({
      cacheName: 'lumin-source',
    })
  );

  const precacheRoute = new workbox.precaching.PrecacheRoute(precacheController, {
    ignoreURLParametersMatching: [/.*/],
  });
  workbox.routing.registerRoute(precacheRoute);

  const navigationRoute = new workbox.routing.NavigationRoute(new workbox.strategies.NetworkOnly());
  workbox.routing.registerRoute(navigationRoute);
  const catchHandler = async () => {
    const cache = await self.caches.open('lumin-source');

    return (await cache.match('/offline.html', { ignoreSearch: true })) || Response.error();
  };

  workbox.routing.setCatchHandler(catchHandler);

  self.onmessage = async (evt) => {
    const {
      action,
      id,
      tFlag: { key },
      input = {},
      data,
    } = evt.data;
    const { id: clientId } = evt.source;
    if (!action) {
      console.warn('Message received with no action:', evt);
      return;
    }
    const flag = await sha256(key);
    if (flag !== TRIGGERED_FLAG) {
      console.warn('Message received with no interact', evt);
      return;
    }
    openDbPromise()
      .then(async (instance) => {
        switch (action) {
          case 'source-caching':
            {
              let unchangedSource = 0;
              let outdatedSource = 0;
              const offlineProcessing = await getRecord(getObjectStore(instance, infoTbl), 'offline_processing');
              if (offlineProcessing) {
                return;
              }
              getObjectStore(instance, infoTbl).put(true, 'is_caching');
              prevDownload({ action, clientId, status: 'downloading' });

              caches
                .open(id)
                .then(async (cache) => {
                  const currentlyCachedRequests = await cache.keys();
                  const cacheUrls = sourceRouteUrls
                    .map(({ cacheKey: url }) => {
                      if (currentlyCachedRequests.find(({ url: cachedUrl }) => cachedUrl === url)) {
                        unchangedSource++;
                        return null;
                      }

                      return url;
                    })
                    .filter(Boolean);

                  for (const cachedRequest of currentlyCachedRequests) {
                    const isCacheExisted = sourceRouteUrls.some(({ cacheKey: url }) => url === cachedRequest.url);
                    if (!isCacheExisted) {
                      outdatedSource++;
                      await cache.delete(cachedRequest);
                    }
                  }

                  await cache.addAll(cacheUrls);

                  // try {
                  //   const offlineHtmlUrl = cacheUrls.find((url) => url.includes('/offline.html'));
                  //   if (offlineHtmlUrl) {
                  //     await cache.addAll([offlineHtmlUrl]);
                  //   }
                  //   const defaultHeaders = await getDefaultHeader(cache);
                  //   const sourceBlob = await getSource();
                  //   const { entries } = await unzip(sourceBlob) || {};
                  //   if (entries) {
                  //     const allEntries = Object.entries(entries).map((entry) => entry);
                  //     const pendingUrl = [];
                  //     await Promise.all(
                  //       cacheUrls.filter((url) => url !== offlineHtmlUrl).map(async (url) => {
                  //         const [name, entryData] = allEntries.find(([name]) => url.includes(name.replace(/build/, ''))) || [];
                  //         if (entryData) {
                  //           const response = new Response(await entryData.blob(), {
                  //             status: 200,
                  //             headers: {
                  //               ...defaultHeaders,
                  //               'Content-Type': mappingExtensions(name)
                  //             }
                  //           });
                  //           await cache.put(url, response);
                  //         } else {
                  //           pendingUrl.push(url);
                  //         }
                  //       })
                  //     );
                  //     if (pendingUrl.length) {
                  //       await cache.addAll(pendingUrl);
                  //     }
                  //   } else {
                  //     await cache.addAll(cacheUrls);
                  //   }
                  // } catch(e) {
                  //   console.log(e);
                  //   await cache.addAll(cacheUrls);
                  // }

                  getObjectStore(instance, infoTbl).put(input.version, 'version');

                  finishedDownload({ action: 'source-caching', clientId });

                  console.log(
                    `%c${cacheUrls.length} resource(s) added, ${outdatedSource} resource(s) removed, ${unchangedSource} resource(s) unchanged`,
                    'color:#ed3d48;font-family:system-ui;'
                  );
                })
                .catch((error) => {
                  console.log(error);
                  abortCaching(clientId);
                });
            }
            break;
          case 'source-update':
            {
              const { newVersion = '', manualUpdate = false } = input;
              let unchangedSource = 0;
              let outdatedSource = 0;
              // const currentVersion = await getRecord(getObjectStore(instance, infoTbl), 'version') || '';
              // if (newVersion && currentVersion && newVersion === currentVersion) {
              //   const cache = await caches.open('lumin-source');
              //   const availableOfflineHtml = await cache.match('/offline.html', { ignoreSearch: true });
              //   if (!availableOfflineHtml) {
              //     const { cacheKey: offlineHtmlUrl } = sourceRouteUrls.find(({ path }) => path.includes('/offline.html')) || {};
              //     if (offlineHtmlUrl) {
              //       await cache.addAll([offlineHtmlUrl]);
              //     }
              //   }
              //   return;
              // }
              const offlineProcessing = await getRecord(getObjectStore(instance, infoTbl), 'offline_processing');
              if (offlineProcessing) {
                return;
              }
              caches
                .open(id)
                .then(async (cache) => {
                  const currentlyCachedRequests = await cache.keys();
                  const cacheUrls = sourceRouteUrls
                    .map(({ cacheKey: url }) => {
                      if (currentlyCachedRequests.find(({ url: cachedUrl }) => cachedUrl === url)) {
                        unchangedSource++;
                        return null;
                      }

                      return url;
                    })
                    .filter(Boolean);

                  if (cacheUrls.length > MAX_CHANGED_TO_UPDATE && !manualUpdate) {
                    getObjectStore(instance, infoTbl).put(true, 'manual_update');
                    finishedDownload({ action: 'source-update', status: 'failed' });
                    return;
                  }
                  prevDownload({ action, clientId, status: 'downloading' });

                  for (const cachedRequest of currentlyCachedRequests) {
                    const isCacheExisted = sourceRouteUrls.some(({ cacheKey: url }) => url === cachedRequest.url);
                    if (!isCacheExisted) {
                      outdatedSource++;
                      await cache.delete(cachedRequest);
                    }
                  }

                  await cache.addAll(cacheUrls);

                  getObjectStore(instance, infoTbl).put(newVersion, 'version');
                  getObjectStore(instance, infoTbl).delete('manual_update');

                  finishedDownload({ action: 'source-update', isManualUpdate: manualUpdate });

                  console.log(
                    `%c${cacheUrls.length} resource(s) added, ${outdatedSource} resource(s) removed, ${unchangedSource} resource(s) unchanged`,
                    'color:#ed3d48;font-family:system-ui;'
                  );
                })
                .catch((error) => {
                  console.log(error);
                  abortCaching(clientId);
                });
            }
            break;
          case 'clean-source':
            {
              getObjectStore(instance, infoTbl).clear();
              getObjectStore(instance, cachesTbl).clear();
              getObjectStore(instance, cmdTbl).clear();
              getObjectStore(instance, cmdTmpTbl).clear();
              getObjectStore(instance, cloudTbl).clear();
              caches.open('lumin-files').then((fileCache) => {
                fileCache.keys().then((requests) => {
                  requests.forEach(({ url }) => {
                    if (!url.includes('/thumbnails/system/')) {
                      fileCache.delete(url);
                    }
                  });
                });
              });
              caches.delete(id);
              notifyToAllClients(
                {
                  process: {
                    success: true,
                    action: 'clean-source',
                    status: 'ok',
                  },
                },
                clientId
              );
            }
            break;
          default:
            notifyToAllClients(
              {
                action,
                data,
              },
              clientId
            );
            break;
        }
      })
      .catch((error) => {
        console.log(error);
        abortCaching(clientId);
      });

    return;
  };
}
