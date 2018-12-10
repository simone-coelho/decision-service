/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       datafile_manager.js
 * Last Modified:   12/8/18 3:59 PM
 *
 */
'use strict';

const fetch = require('node-fetch');
const utils = require('../utilities/utils');
const WebSocket = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');
const config = require('../configuration/config');
const sdk = config.sdk;
const EventEmitter = require('events');
const schedule = require('node-schedule');
let datafileKeys = [];

// EventEmitter object
let datafileEvent = new EventEmitter();

/***** Start Websockets *****/
const wsOptions = {
  WebSocket: WebSocket,
};

// let wsClient = new WebSocket(config.server.WEBSOCKET_SERVER, '', null);
const wsClient = new ReconnectingWebSocket(config.server.WEBSOCKET_SERVER, [], wsOptions);

wsClient.onopen = function() {
  console.log('Websocket client connected to datafile manager server.');
  // ToDo - Set option on server start to request files or keys
  // wsClient.send(JSON.stringify({type: 'get_sdk_keys', data: ''}), {}, null);
  wsClient.send(JSON.stringify({type: 'get_datafiles', data: ''}), {}, null);
};

wsClient.onclose = function() {
  console.log('Websocket client was disconnected from datafile manager server.');
};

// Log errors
wsClient.onerror = function(error) {
  console.error('WebSocket Error: ' + error.message);
};

// messages from the server
wsClient.onmessage = function(message) {
  let messageObj = JSON.parse(message.data);
  switch (messageObj.type) {
    case 'active_sdk_keys':
      if (messageObj.data.length > 0) {
        console.log('Websocket retrieved datafiles from CDN with SDK keys: ' + messageObj.data);
        refreshDatafilesByKeys(messageObj.data);
      } else {
        console.log(
            'Websocket did not receive any datafile SDK keys from the datafile manager server.');
      }
      break;
    case 'active_datafile':
      console.log('Websocket received JSON datafile with SDK key: ' + messageObj.id);
      refreshDatafile(messageObj.data, messageObj.id);
      break;
    case 'server_message':
      console.log('WS server message: ', messageObj.data);
      break;
  }
};

/***** End Websockets *****/


function refreshDatafilesByKeys(sdkKeys) {
  datafileKeys = sdkKeys;
  datafileEvent.emit('updated_datafile_keys', datafileKeys);
}

function refreshDatafile(datafile, key) {
  if (!datafileKeys.includes(key)) {
    datafileKeys.push(key);
  }
  datafileEvent.emit('updated_datafile', datafile, key);
}

/**
 * Fetches "async" a datafile from a CDN or remote server.
 *
 * @param url
 * @returns {Promise<object>}
 */
function fetchFileAsync(url) {
  return fetch(url);
}

/**
 * Fetches a datafile from a CDN or remote server.
 *
 * @param url
 * @returns {Promise<object>}
 */
async function fetchFileSync(url) {
  const response = await fetch(url);
  return await response.json();
}

/**
 * Fetches the SDK datafile from a CDN or remote server.
 *
 * @param datafileKey
 * @param dest
 * @returns {Promise<*>}
 */
async function fetchDatafile(datafileKey, dest) {
  try {
    let datafile = await fetchFileSync(
        utils.placeHolder(config.sdk._SDK_URL, {SDK_KEY: datafileKey}));
    if (datafile) {
      sdk.DATAFILE = datafile;
      sdk.DATAFILE_REVISION = sdk.DATAFILE.revision;
      //await utils.writeFile(sdk.DATAFILE_PATH, JSON.stringify(datafile));
      console.log('Successfully downloaded datafile: ' + datafileKey + ' [Revision: ' +
          sdk.DATAFILE.revision + ']');
    }
    return datafile;
  } catch (err) {
    console.error('Unable to download datafile - ' + err);
    return null;
  }
}

module.exports = datafileEvent;
module.exports.downloadFileSync = fetchDatafile;