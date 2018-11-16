/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       datafile_manager.js
 * Last Modified:   11/15/18 2:02 AM
 *
 */

const fetch = require('node-fetch');
const utils = require('../utilities/utils');
const config = require('../configuration/config');
const sdk = config.sdk;
const EventEmitter = require('events');
const schedule = require('node-schedule');

// EventEmitter object
let datafileEvent = new EventEmitter();

/**
 * Scheduler responsible for datafile download at defined interval.
 */
schedule.scheduleJob(sdk.UPDATE_INTERVAL, function() {
  const previousRevision = sdk.DATAFILE_REVISION;
  fetchFileAsync(sdk.DATAFILE_URL).then(function(response) {
    return response.json();
  }).then(function(jsonData) {
    let datafile = jsonData;
    if (datafile) {
      utils.writeFile(sdk.DATAFILE_PATH, JSON.stringify(datafile));
      sdk.DATAFILE = datafile;
      sdk.DATAFILE_REVISION = sdk.DATAFILE.revision;
      console.log('Successfully downloaded datafile: ' + sdk.DATAFILE_URL + ' [Revision: ' +
          sdk.DATAFILE.revision + ']');
      if ((datafile) && (previousRevision !== sdk.DATAFILE.revision)) {
        datafileEvent.emit('updated_datafile', sdk.DATAFILE, previousRevision,
            sdk.DATAFILE_REVISION);
      }
    }
  }).catch(function(error) {
    console.log('Error: ', error);
  });
});

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
 * @param url
 * @param dest
 * @returns {Promise<*>}
 */
async function fetchDatafile(url, dest) {
  try {
    let datafile = await fetchFileSync(url);
    if (datafile) {
      await utils.writeFile(sdk.DATAFILE_PATH, JSON.stringify(datafile));
      sdk.DATAFILE = datafile;
      sdk.DATAFILE_REVISION = sdk.DATAFILE.revision;
      console.log('Successfully downloaded datafile: ' + sdk.DATAFILE_URL + ' [Revision: ' +
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