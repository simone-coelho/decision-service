/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       optimizely_manager.js
 * Last Modified:   11/15/18 2:02 AM
 *
 */

'use strict';

/**
 * Wrapper around the server side SDK.
 * Manages the optimizely instance.
 */
const optimizely = require('@optimizely/optimizely-sdk');
const config = require('../configuration/config');
const sdk = config.sdk;
const database = require('../database/database');
const datafileManager = require('./datafile_manager');

// Register the logger with sdk.
const defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger');
const LOG_LEVEL = require(
    '@optimizely/optimizely-sdk/lib/utils/enums').LOG_LEVEL;
const NOTIFICATION_TYPES = require(
    '@optimizely/optimizely-sdk/lib/utils/enums').NOTIFICATION_TYPES;


// Used to work around Async/Sync difference in User Profiles.
let activeUserId = '';
let cachedUserProfileMap = '';

// Possible future use in saving user state
let experimentActivated = false;


// Singleton instance of the optimizely object
let optlyInstance;

/**
 * Notification listener for new datafile download updates
 */
datafileManager.on('updated_datafile', function(datafile, prevRev, newRev) {
    reInitializeClient(datafile);
    console.log(
        'Updated datafile: ' + sdk.DATAFILE_URL + ' from revision ' +
        prevRev + ' to revision ' + newRev);
});

/**
 * Reinitialize the Optimizely client instance
 * @param {Object} datafile
 *   The project configuration datafile used to instantiate the sdk
 */
function reInitializeClient(datafile) {
  optlyInstance = null;
  _getInstance(datafile);
}

module.exports = {
  /**
   * Get the singleton sdk client instance.
   * @return {Object}
   *   The optimizely sdk client instance
   */
  async getInstance(datafile) {
    // check if we have a active datafile or if we are forced to re-fetch it
    let instance = null;

    if (!sdk.DATAFILE || datafile) {
      await getDataFile(sdk.DATAFILE_URL).then((fetchedDatafile) => {
        instance = _getInstance(fetchedDatafile);
      });
    } else {
      instance = _getInstance(sdk.DATAFILE);
    }

    if (!instance) {
      throw new Error('Unable to instantiate the Optimizely client');
    }

    return instance;
  },

  /**
   * Activates an experiment and returns the variation. This function supports the
   * RPC 'experiment' function in methods.js.
   * @param expObj
   *   The experiment object is created and passed in by RPC method JSON param.
   * @returns {Promise<*>}
   *   Experiment object with assigned variation.
   */
  async activateExperiment(expObj) {
    if (!optlyInstance) {
      await getInstance();
    }

    activeUserId = expObj.user_id;
    await getUserProfileMap(activeUserId).then(userProfileMap => {
      cachedUserProfileMap = userProfileMap;
    });

    expObj.variation_key = optlyInstance.activate(expObj.experiment_key,
        expObj.user_id,
        expObj.attributes);

    experimentActivated = expObj.variation_key !== null;

    return expObj;
  },

  /**
   * Returns the cached current datafile
   * @return {Object}
   */
  getCachedDataFile() {
    return sdk.DATAFILE;
  },
  getExperimentActivated() {
    return experimentActivated;
  },
};

/**
 * Creates the sdk client instance.
 * @param datafile
 *   Datafile with current project configuration.
 * @returns {object}
 *   Optimizely sdk client instance
 * @private
 */
function _getInstance(datafile) {
  if (!optlyInstance) {
    optlyInstance = optimizely.createInstance({
      datafile,
      userProfileService,
      // This should be set to/ false if we modify the activeDatafile in any way
      skipJSONValidation: true,
      logger: defaultLogger.createLogger({
        logLevel: LOG_LEVEL.INFO,
      }),
    });

    registerListeners(optlyInstance);
  }

  return optlyInstance;
}

/**
 * Retrieves the project configuration datafile.
 * @param url
 *   The url path to the CDN or location of the datafile.
 * @returns {Promise<*>}
 *   Contains the downloaded datafile JSON.
 */
async function getDataFile(url) {
  await datafileManager.downloadFileSync(url);
  return sdk.DATAFILE;
}


/**
 * Retrieves the user profile from the data store.
 * @param userId
 *   The User ID used to activate an experiment or feature.
 * @returns {Promise<*>}
 *   Contains the user profile map object.
 */
async function getUserProfileMap(userId) {
  try {
    let result = await database.dbClient.get(userId);
    let userProfileMap = null;
    if (result) {
      userProfileMap = JSON.parse(result);
    }

    return userProfileMap;
  } catch (err) {
    console.error('Get user profile - ' + err);
  }
}

/**
 * Saves the user profile map to the data store.
 * @param {object} userProfileMap
 *   The updated user profile map object.
 * @returns {Promise<void>}
 */
async function saveUserProfileMap(userProfileMap) {
  try {
    await database.dbClient.set(activeUserId,
        JSON.stringify(userProfileMap));
  } catch (err) {
    console.error('Save user profile - ' + err);
  }
}

/**
 * Register required functions with the sdk to load and save the user profile.
 * @type {{lookup: (function(*): string), save: userProfileService.save}}
 */
let userProfileService = {
  lookup: function(userId) {
    return cachedUserProfileMap;
  },
  save: function(userProfileMap) {
    // noinspection JSIgnoredPromiseFromCall
    saveUserProfileMap(userProfileMap);
  },
};


/**
 *  Register notification Listeners.
 *  Activate: notifies every time an experiment is activated.
 *  Track:    notifies every time a track event is made.
 *  @param {object} optlyClient
 *    The active sdk client instance.
 */
function registerListeners(optlyClient) {
  // Register the "Experiment Activation" notification listener
  let activateId = optlyClient.notificationCenter.addNotificationListener(
      NOTIFICATION_TYPES.ACTIVATE,
      onActivate,
  );

  // Register the "Tracking" notification listener
  let trackId = optlyClient.notificationCenter.addNotificationListener(
      NOTIFICATION_TYPES.TRACK,
      onTrack,
  );
}

/**
 * Listen to activated experiments.
 * @param activateObject
 *   Contains the experiment information like experiment, user and variation ID
 */
function onActivate(activateObject) {
  //console.info(
  //    `Activation called for experiment ${activateObject.experiment.key}`,
  //);
}

/**
 * Listen to tracking events.
 * @param trackObject
 *   Contains the event information like event and user ID
 */
function onTrack(trackObject) {
  //console.info(`Tracking called for event ${trackObject.eventKey}`);
}

