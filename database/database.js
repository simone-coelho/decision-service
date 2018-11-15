/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       database.js
 * Last Modified:   11/15/18 2:02 AM
 *
 */

'use strict';

const config = require('../configuration/config');
const db = config.db;

// Redis
const asyncRedis = require('async-redis');
const redisClient = asyncRedis.createClient(db.REDIS_PORT, db.REDIS_PATH);


module.exports = {
  /**
   *  Database client. It is currently using Redis but could be
   *  configured to use any database or data store by changing the
   *  load and save functions.
   */
  dbClient: redisClient,
  /**
   *
   * @param projectId
   * @param datafile
   * @returns {Promise<void>}
   */
  saveDatafileToDB: async function(projectId, datafile) {
    try {
      await
          redisClient.set(projectId, JSON.stringify(datafile));
    } catch (err) {
      console.error('Unable to save datafile to Redis - ' + err);
      return null;
    }
  },

  /**
   * Loads a datafile from the data store.
   * @param projectId
   * @returns {Promise<*>}
   */
  loadDatafileFromDB: async function(projectId) {
    try {
      let result = await
          redisClient.get(projectId);
      let datafile = null;

      if (result) {
        datafile = JSON.parse(result);
      }

      return datafile;
    } catch (err) {
      console.error('Unable to load datafile from Redis - ' + err);
      return null;
    }
  },
};

/**
 * Redis - Listen for errors.
 */
redisClient.on('error',
    function(err) {
      console.error('Error: ' + err);
    });

/**
 * Redis - Listen for ready state.
 */
redisClient.on('ready',
    function(err) {
      console.log('Redis has started and is listening on ' + db.REDIS_PATH + ':' + db.REDIS_PORT);
    });

