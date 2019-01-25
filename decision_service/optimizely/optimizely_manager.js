/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       optimizely_manager.js
 * Last Modified:   12/9/18 2:48 AM
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
//const eventDispatcher = require('./event_dispatcher');
const instanceCache = require('../database/db');

// Register the logger with the sdk.
const defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger');
const LOG_LEVEL = require(
    '@optimizely/optimizely-sdk/lib/utils/enums').LOG_LEVEL;
const NOTIFICATION_TYPES = require(
    '@optimizely/optimizely-sdk/lib/utils/enums').NOTIFICATION_TYPES;

// Used to work around Async/Sync difference in User Profiles.
let activeUserId = '';
let cachedUserProfileMap = '';

// Possible future use in saving user state.
let experimentActivated = false;
let userProfileIsActive = false;

// Singleton instance of the optimizely object.
let optlyInstance;

/**
 * Notification listener for new datafile download updates.
 */
datafileManager.on('updated_datafile_keys', function (datafileKeys) {
    for (const key of datafileKeys) {
        console.log(
            'Start - Reinitialize client with updated datafile: ' + key);
        reInitializeClient(key, true);
    }
});

datafileManager.on('updated_datafile', function (datafile, key) {
    console.log('Start - Reinitialize client with updated datafile: ' + key);
    reInitializeClient(key, true, datafile);
});

/**
 * Reinitialize the Optimizely client instance
 *
 * @param {Object} datafileKey
 *   The project configuration datafile key used to instantiate the sdk.
 * @param fullRefresh
 * @param datafile
 */
function reInitializeClient (datafileKey, fullRefresh, datafile) {
    optlyInstance = null;
    // ToDo - return true/false if successful
    module.exports.getInstance(datafileKey, fullRefresh, datafile);
    console.log('Completed - Reinitialize client with updated datafile: ' +
                    datafileKey);
}

module.exports = {
    /**
     * Get the singleton sdk client instance.
     *
     * @param datafileKey
     * @param fullRefresh
     * @param datafile
     *
     * @return {Promise<*>}
     *   The optimizely sdk client instance
     */
    async getInstance (datafileKey, fullRefresh, datafile) {
        // Check if we have a active datafile or if we are forced to re-fetch it.
        let instance = null;
        let cachedInstance = null;
        let newDatafile = null;

        if ((fullRefresh) || (datafile)) {
            instanceCache.optlyClients.delete(datafileKey);
        } else {
            cachedInstance = instanceCache.optlyClients.fetch(datafileKey);
        }

        if (!cachedInstance) {
            if (datafile) {
                newDatafile = datafile;
            } else {
                newDatafile = await getDataFile(datafileKey);
            }

            if (!newDatafile) {
                throw new Error(
                    'Unable to retrieve the SDK datafile: ' + datafileKey);
            }

            instance = _getInstance(newDatafile);
            let storedInstance = {};
            storedInstance.id = datafileKey;
            storedInstance.instance = instance;
            instanceCache.optlyClients.save(storedInstance);
        } else {
            instance = cachedInstance.instance;
        }

        if (!instance) {
            throw new Error('Unable to instantiate the Optimizely client');
        }

        optlyInstance = instance;
        return instance;
    },

    /**
     * Activates an experiment and returns the variation. This function supports the
     * RPC 'experiment' function in methods.js.
     *
     * @param expObj
     *   The experiment object is created and passed in by the RPC method JSON param.
     * @returns {Promise<*>}
     *   Experiment object with assigned variation.
     */
    async activateExperiment (expObj) {
        activeUserId = expObj.user_id;
        if (userProfileIsActive) {
            await getUserProfileMap(activeUserId).then(userProfileMap => {
                cachedUserProfileMap = userProfileMap;
            });
        }

        expObj.variation_key = optlyInstance.activate(expObj.experiment_key,
                                                      expObj.user_id,
                                                      expObj.attributes);

        experimentActivated = expObj.variation_key !== null;

        return expObj;
    },

    /**
     * Returns the cached current datafile.
     *
     * @return {Object}
     */
    getCachedDataFile () {
        return sdk.DATAFILE;
    }, getExperimentActivated () {
        return experimentActivated;
    }
};

/**
 * Returns the user profile service if the database is configured.
 *
 * @param dbConfig
 * @returns {object}
 * @private
 */
function _getUserProfileService (dbConfig) {
    if ((config.db.REDIS_PATH) && (config.db.REDIS_PATH !== '')) {
        return {};
    } else {
        userProfileIsActive = true;
        return userProfileService;
    }
}

/**
 * Creates the sdk client instance.
 *
 * @param datafile
 *   Datafile with current project configuration.
 * @returns {object}
 *   Optimizely sdk client instance.
 * @private
 */
function _getInstance (datafile) {
    optlyInstance = optimizely.createInstance({
                                                  datafile, // This should be set to false if we modify the
                                                  // activeDatafile in any way.
                                                  _getUserProfileService,
                                                  skipJSONValidation: true,
                                                  //eventDispatcher: eventDispatcher,
                                                  logger: defaultLogger.createLogger(
                                                      {
                                                          logLevel: LOG_LEVEL.ERROR
                                                      })
                                              });

    registerListeners(optlyInstance);

    return optlyInstance;
}

/**
 * Retrieves the project configuration datafile.
 *
 * @param url
 *   The url path to the CDN or location of the datafile.
 * @returns {Promise<*>}
 *   Contains the downloaded datafile JSON.
 */
async function getDataFile (url) {
    return await datafileManager.downloadFileSync(url);
}

/**
 * Retrieves the user profile from the data store.
 *
 * @param userId
 *   The User ID used to activate an experiment or feature.
 * @returns {Promise<*>}
 *   Contains the user profile map object.
 */
async function getUserProfileMap (userId) {
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
 *
 * @param {object} userProfileMap
 *   The updated user profile map object.
 * @returns {Promise<void>}
 */
async function saveUserProfileMap (userProfileMap) {
    try {
        await database.dbClient.set(activeUserId,
                                    JSON.stringify(userProfileMap));
    } catch (err) {
        console.error('Save user profile - ' + err);
    }
}


/**
 * Register required functions with the sdk to load and save the user profile.
 */
let userProfileService = {
    lookup: function (userId) {
        return cachedUserProfileMap;
    }, save: function (userProfileMap) {
        // noinspection JSIgnoredPromiseFromCall
        saveUserProfileMap(userProfileMap);
    }
};

/**
 *  Register notification Listeners.
 *  Activate: notifies every time an experiment is activated.
 *  Track:    notifies every time a track event is made.
 *
 *  @param {object} optlyClient
 *    The active sdk client instance.
 */
function registerListeners (optlyClient) {
    // Register the "Experiment Activation" notification listener
    let activateId = optlyClient.notificationCenter.addNotificationListener(
        NOTIFICATION_TYPES.ACTIVATE, onActivate);

    // Register the "Tracking" notification listener
    let trackId = optlyClient.notificationCenter.addNotificationListener(
        NOTIFICATION_TYPES.TRACK, onTrack);
}

/**
 * Listen to activated experiments.
 *
 * @param activateObject
 *   Contains the experiment information such as experiment, user and variation ID.
 */
function onActivate (activateObject) {
    //console.info(
    //    `Activation called for experiment ${activateObject.experiment.key}`,
    //);
}

/**
 * Listen to tracking events.
 *
 * @param trackObject
 *   Contains the event information such as event and user ID.
 */
function onTrack (trackObject) {
    //console.info(`Tracking called for event ${trackObject.eventKey}`);
}

