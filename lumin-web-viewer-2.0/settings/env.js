/// <reference path="./env.d.ts" />
/* eslint-disable */
'use strict'

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

const LUMIN = /^LUMIN_/i;

function getCoreVersion() {
  try {
    const { version } = require('../lib/package.json');
    return version;
  } catch (error) {
    // When running eslint, ..lib/package.json is not available
    return '';
  }
}

function loadLuminEnviroment(jsonEnv = {}) {
    jsonEnv['LUMIN_CORE_VERSION'] = getCoreVersion();
    const [publicRaw, publicStringEnv] = Object.keys(jsonEnv)
    .filter((key) => LUMIN.test(key))
    .reduce(([env, envString], key) => {
        const replaceKey = key.replace('LUMIN_', '');
        env[replaceKey] = jsonEnv[key];
        envString[replaceKey] = JSON.stringify(jsonEnv[key]);
        return [env, envString];
    }, [{}, {}]);
    const [privateRaw, privateStringEnv] = Object.keys(process.env)
    .filter((key) => LUMIN.test(key))
    .reduce(([env, envString], key) => {
        const replaceKey = key.replace('LUMIN_', '');
        env[replaceKey] = process.env[key];
        envString[replaceKey] = JSON.stringify(process.env[key]);
        return [env, envString];
    }, [{}, {}])

    const raw = {
        ...publicRaw,
        ...privateRaw,
    }

    // Nested `process.env` alone does not reliably replace `process.env.FOO` in Rspack/Webpack;
    // flatten so each `process.env.KEY` is a distinct define (matches CRA-style env inlining).
    const flattenedProcessEnv = Object.keys(raw).reduce((acc, key) => {
        const val = raw[key];
        acc[`process.env.${key}`] =
            val === undefined ? 'undefined' : JSON.stringify(val);
        return acc;
    }, {});

    const rawString = {
        'process.env': {
            ...publicStringEnv,
            ...privateStringEnv,
        },
        ...flattenedProcessEnv,
    };
    return { raw, rawString };
}

module.exports = loadLuminEnviroment;