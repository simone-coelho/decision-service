/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       config.js
 * Last Modified:   11/15/18 2:02 AM
 *
 */

const utils = require('../utilities/utils');

let config = {
  // SDK
  sdk: {
    //Using Project ID
    PROJECT_ID: process.env.PROJECT_ID || '12101591721',
    SDK_URL_ID: process.env.SDK_URL_ID ||
        'https://cdn.optimizely.com/json/12101591721.json',
    _SDK_URL_ID: 'https://cdn.optimizely.com/json/${PROJECT_ID}.json',

    // Using SDK Key
    SDK_KEY: process.env.SDK_KEY || 'L7omXhmSV2Qa1DTbW2JeVB',
    SDK_URL: process.env.SDK_URL ||
        'https://cdn.optimizely.com/datafiles/L7omXhmSV2Qa1DTbW2JeVB.json',
    _SDK_URL:  'https://cdn.optimizely.com/datafiles/${SDK_KEY}.json',

    // Datafile settings
    DATAFILE_DIR: process.env.DATAFILE_DIR || 'datafiles/',
    DATAFILE_NAME: process.env.DATAFILE_NAME || 'datafile.json',
    DATAFILE_PATH: process.env.DATAFILE_PATH || '',
    DATAFILE_URL: '',
    DATAFILE_URL_ID: '',

    // Active datafile
    DATAFILE: null,
    DATAFILE_REVISION: 0,

    // Update settings
    UPDATE_INTERVAL: '*/15 * * * *',
    WEBHOOK_URL: process.env.WEBHOOK_URL || '',
    WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN || '',
  },
  db: {
    // Database
    REDIS_PATH: process.env.REDIS_PATH || '127.0.0.1',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    REDIS_AUTH: process.env.REDIS_AUTH || '',
  },
  server: {
    // HTTP Server
    NODE_PORT: process.env.NODE_PORT || 9090,
  },
};

// Default datafile URL paths by Key and Project ID
config.sdk.DATAFILE_URL = utils.placeHolder(config.sdk._SDK_URL,
    {SDK_KEY: config.sdk.SDK_KEY});

config.sdk.DATAFILE_URL_ID = utils.placeHolder(config.sdk._SDK_URL_ID,
    {SDK_KEY: config.sdk.SDK_KEY});

// Directory to save datafile
config.sdk.DATAFILE_PATH = config.sdk.DATAFILE_DIR + config.sdk.DATAFILE_NAME;

// Export
module.exports = config;