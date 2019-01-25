/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       config.js
 * Last Modified:   12/8/18 2:07 PM
 *
 */

const utils = require('../utilities/utils');

let config = {
  // SDK
  sdk: {
    //Any global attributes that should be included in all API functions
    GLOBAL_ATTRIBUTES: {},

    // Specifies the experiment activation interval in hours.
    // A value of "0" means that activation will occur on every call.
    activation_interval: 0,

    // Using Project ID
    //PROJECT_ID: process.env.PROJECT_ID || '12101591721',
    //SDK_URL_ID: process.env.SDK_URL_ID ||
//        'https://cdn.optimizely.com/json/12101591721.json',
    //_SDK_URL_ID: 'https://cdn.optimizely.com/json/${PROJECT_ID}.json',

    // Using SDK Key
    //SDK_KEY: process.env.SDK_KEY || 'L7omXhmSV2Qa1DTbW2JeVB',
    //SDK_URL: process.env.SDK_URL ||
    //    'https://cdn.optimizely.com/datafiles/L7omXhmSV2Qa1DTbW2JeVB.json',
    // ******* No longer implemented *******
    _SDK_URL:  'https://cdn.optimizely.com/datafiles/${SDK_KEY}.json',
    // Use this constant for the endpoint to connect to the datafile manager
    _SDK_URL_PATH: '/datafile/json/${SDK_KEY}',

    // Datafile settings
    //DATAFILE_DIR: process.env.DATAFILE_DIR || 'datafiles/',
    //DATAFILE_NAME: process.env.DATAFILE_NAME || 'datafile.json',
    //DATAFILE_PATH: process.env.DATAFILE_PATH || '',
    get DATAFILE_URL() {
      return utils.placeHolder(this._SDK_URL,
          {SDK_KEY: this.SDK_KEY});
    },
    get DATAFILE_URL_ID() {
      return utils.placeHolder(this._SDK_URL_ID,
          {SDK_KEY: this.sdk.SDK_KEY});
    },

    // Active datafile
    //DATAFILE: null,
    DATAFILE_REVISION: 0,

    // Datafile update interval currently defaults to 15 minutes. Polling fir updated
    // datafiles will occur at this "cron" interval.
    UPDATE_INTERVAL: '*/15 * * * *',

    // Webhook settings
    WEBHOOK_URL: process.env.WEBHOOK_URL || '',
    WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN || '',
  },
  db: {
    // Database

    // *Comment the following line to enable the user profile.
    REDIS_PATH: '',
    // *Uncomment the following  line to enable the user profile.
    // REDIS_PATH: process.env.REDIS_PATH || '127.0.0.1',
    //
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    REDIS_AUTH: process.env.REDIS_AUTH || '',
  },
  server: {
    // HTTP Server
    NODE_PORT: process.env.NODE_PORT || 9090,
    // GRPC Server
    GRPC_PORT: `0.0.0.0:${process.env.GRPC_PORT || '1337'}`,
    // Websocket Server
    DATAFILE_SERVER: process.env.DATAFILE_SERVER || 'localhost:2222',
  },
};


// Export
module.exports = config;
