'use strict';

const db = require('../database/db');
const validate = require('../types/json_validator');
const optimizely = require('../optimizely/optimizely_manager');

/**
 * HTTP Remote Procedure Call Methods
 * @type {{experiment:{description:string, params:string[], returns:string[], exec(*=):*},
 *       track:{description:string, params:string[], returns:string[], exec(*=):*},
 *       features:{description:string, params:Array, returns:string[], exec(*=):*},
 *       task:{description:string, params:string[], returns:string[], exec(*):*}}}
 */
let methods = {
  /**
   * Activates an experiment and obtains a variation.
   *
   * @param expObj
   *   Experiment JSON object.
   *   Refer to types.js for a description of the JSON schema definitions.
   * @returns {Promise<object>}
   *   Contains expObj with the assigned variation.
   */
  experiment: {
    description: `activates the experiment, and returns the assigned variation`,
    params: ['expObj: the experiment object'],
    returns: ['expObj: object with variation key assigned'],
    exec(expObj) {
      return new Promise((resolve, reject) => {
        if (typeof (expObj) !== 'object') {
          throw new Error('Undefined or invalid JSON object');
        }

        // Validate JSON from schema
        let validJSON = validate.experiments(expObj);
        if (!validJSON) {
          throw new Error(validate.ajv.errorsText(validate.experiments.errors));
        }

        optimizely.getInstance().then(optly => {
          let result = optimizely.activateExperiment(expObj);
          resolve(result);
        }).catch(function() {
          reject('Unable to instantiate the Optimizely client');
        });

      });
    },
  },

  /**
   * Track conversion events.
   *
   * @param trackObj
   *   Refer to types.js for a description of the JSON schema definition.
   * @returns {Promise<object>}
   *   trackObj with acknowledgement message of success or failure.
   */
  track: {
    description: `track a conversion event`,
    params: ['trackObj: the track event object'],
    returns: ['trackObj: event object with acknowledgement'],
    exec(trackObj) {
      return new Promise((resolve, reject) => {
        if (typeof (trackObj) !== 'object') {
          throw new Error('Undefined or invalid JSON object');
        }

        // Validate JSON from schema
        let validJSON = validate.track(trackObj);
        if (!validJSON) {
          throw new Error(validate.ajv.errorsText(validate.track.errors));
        }

        optimizely.getInstance().then(optly => {
          optly.track(trackObj.event_key,
              trackObj.user_id,
              trackObj.attributes,
              trackObj.tags);
          trackObj.acknowledgement = 'success';

          resolve(trackObj);
        }).catch(function() {
          reject('Unable to instantiate the Optimizely client');
        });
      });
    },
  },

  /**
   * Activate a feature test or check for enabled feature flags.
   *
   * @param featuresObj
   *   Refer to types.js for a description of the JSON schema definition.
   * @returns {Promise<object>}
   *   featuresObj and all enabled features and variable values if defined.
   */
  features: {
    description: `activates a feature flag or feature test and returns the variable values if any`,
    params: ['featuresObj: the features object'],
    returns: ['featuresObj: object with the variable values if requested'],
    exec(featuresObj) {
      return new Promise((resolve, reject) => {
        if (typeof (featuresObj) !== 'object') {
          throw new Error('Undefined or invalid JSON object');
        }

        // Validate JSON from schema
        let validJSON = validate.feature_test(featuresObj);
        if (!validJSON) {
          throw new Error(
              validate.ajv.errorsText(validate.feature_test.errors));
        }

        optimizely.getInstance().then(optly => {
          featuresObj.is_enabled = optly.isFeatureEnabled(
              featuresObj.feature_key,
              featuresObj.user_id,
              featuresObj.attributes);

          if (featuresObj.is_enabled) {

            if ((featuresObj.feature_test_key) &&
                (featuresObj.feature_test_key !== '')) {
              featuresObj.variation_key = optly.getVariation(
                  featuresObj.feature_test_key,
                  featuresObj.user_id,
                  featuresObj.attributes);
            }

            let feature_config = featuresObj.feature_config;
            for (let key of Object.keys(feature_config)) {
              switch (feature_config[key]) {
                case 'integer':
                  feature_config[key] = optly.getFeatureVariableInteger(
                      featuresObj.feature_key,
                      key,
                      featuresObj.user_id,
                      featuresObj.attributes);
                  break;
                case 'string':
                  feature_config[key] = optly.getFeatureVariableString(
                      featuresObj.feature_key,
                      key,
                      featuresObj.user_id,
                      featuresObj.attributes);
                  break;
                case 'boolean':
                  feature_config[key] = optly.getFeatureVariableBoolean(
                      featuresObj.feature_key,
                      key,
                      featuresObj.user_id,
                      featuresObj.attributes);
                  break;
                case 'double':
                  feature_config[key] = optly.getFeatureVariableDouble(
                      featuresObj.feature_key,
                      key,
                      featuresObj.user_id,
                      featuresObj.attributes);
                  break;
                default:
                  feature_config[key] = null;
              }
            }
          }
          resolve(featuresObj);
        }).catch(function() {
          reject('Unable to instantiate the Optimizely client');
        });
      });
    },
  },

  /**
   * Work in progress - Not functional
   *
   * @param taskObj
   * @returns {Promise<object | string>}
   */
  task: {
    description: `[Not functional] creates a new task, and returns the details of the new task`,
    params: ['taskObj: the task object'],
    returns: ['taskObj'],
    exec(taskObj) {
      return new Promise((resolve, reject) => {

        // you would usually do some validations here
        // and check for required fields

        // create a task object, then save it to db
        // attach an id the save to db
        let task = {
          user_id: taskObj.userId,
          taskContent: taskObj.taskContent,
          expiry: taskObj.expiry,
        };

        resolve(db.tasks.save(task));
      });
    },
  },

  /**
   * Returns the variation for an experiment or feature test
   *
   * @param expObj
   *   Experiment or feature test JSON object.
   *   Refer to types.js for a description of the JSON schema definitions.
   * @returns {Promise<object>}
   *   Contains expObj with the assigned variation.
   */
  get_variation: {
    description: `returns the variation for an experiment or feature test`,
    params: ['expObj: the get_variation object'],
    returns: ['expObj: object with variation key assigned'],
    exec(expObj) {
      return new Promise((resolve, reject) => {
        if (typeof (expObj) !== 'object') {
          throw new Error('Undefined or invalid JSON object');
        }

        // Validate JSON from schema
        let validJSON = validate.get_variation(expObj);
        if (!validJSON) {
          throw new Error(validate.ajv.errorsText(validate.get_variation.errors));
        }

        optimizely.getInstance().then(optly => {
          expObj.variation_key = optly.getVariation(expObj.experiment_key,
              expObj.user_id,
              expObj.attributes);

          resolve(expObj);
        }).catch(function() {
          reject('Unable to instantiate the Optimizely client');
        });
      });
    },
  },
  /**
   * Forces a user into a specified variation for an experiment or feature test
   *
   * @param expObj
   *   Experiment or feature test JSON object.
   *   Refer to types.js for a description of the JSON schema definitions.
   * @returns {Promise<object>}
   *   Contains expObj with the property "variation_forced" set to true if
   *   the operation was successful or false if it was not.
   */
  set_forced_variation: {
    description: `sets an experiment or feature test variation`,
    params: ['expObj: the set_forced_variation object'],
    returns: ['expObj: object with "variation_forced" boolean result of true or false'],
    exec(expObj) {
      return new Promise((resolve, reject) => {
        if (typeof (expObj) !== 'object') {
          throw new Error('Undefined or invalid JSON object');
        }

        // Validate JSON from schema
        let validJSON = validate.get_variation(expObj);
        if (!validJSON) {
          throw new Error(validate.ajv.errorsText(validate.set_variation.errors));
        }

        optimizely.getInstance().then(optly => {
          expObj.variation_forced = optly.setForcedVariation(expObj.experiment_key,
              expObj.user_id,
              expObj.variation_key);

          delete expObj.attributes;

          resolve(expObj);
        }).catch(function() {
          reject('Unable to instantiate the Optimizely client');
        });
      });
    },
  },
  /**
   * Returns the forced variation set by Set Forced Variation, or null if no variation was forced.
   *
   * @param expObj
   *   Experiment or feature test JSON object.
   *   Refer to types.js for a description of the JSON schema definitions.
   * @returns {Promise<object>}
   *   Contains expObj with the property "variation_key" value if a variation was forced
   */
  get_forced_variation: {
    description: `returns the forced variation set by Set Forced Variation, or null if no variation was forced`,
    params: ['expObj: the get_forced_variation object'],
    returns: ['expObj: object with the "variation_key" value if a variation was forced'],
    exec(expObj) {
      return new Promise((resolve, reject) => {
        if (typeof (expObj) !== 'object') {
          throw new Error('Undefined or invalid JSON object');
        }

        // Validate JSON from schema
        let validJSON = validate.get_variation(expObj);
        if (!validJSON) {
          throw new Error(validate.ajv.errorsText(validate.get_variation.errors));
        }

        optimizely.getInstance().then(optly => {
          expObj.variation_key = optly.getForcedVariation(expObj.experiment_key,
              expObj.user_id);

          delete expObj.attributes;

          resolve(expObj);
        }).catch(function() {
          reject('Unable to instantiate the Optimizely client');
        });
      });
    },
  },
  /**
   * Retrieves a list of all the features that are enabled for the user.
   *
   * @param expObj
   *   Feature test JSON object.
   *   Refer to types.js for a description of the JSON schema definitions.
   * @returns {Promise<object>}
   *   Contains featuresObj with the property "features_list" that contains a list of
   *   keys corresponding to the features that are enabled for the user.
   */
  get_enabled_features: {
    description: `retrieves a list of all the features that are enabled for the user`,
    params: ['featuresObj: the get_enabled_features object'],
    returns: [
      'featuresObj: object that contains the property "features_list" with a list of keys ' +
      'corresponding to the features that are enabled'],
    exec(featuresObj) {
      return new Promise((resolve, reject) => {
        if (typeof (featuresObj) !== 'object') {
          throw new Error('Undefined or invalid JSON object');
        }

        // Validate JSON from schema
        let validJSON = validate.enabled_features(featuresObj);
        if (!validJSON) {
          throw new Error(validate.ajv.errorsText(validate.enabled_features.errors));
        }

        optimizely.getInstance().then(optly => {
          featuresObj.features_list = optly.getEnabledFeatures(featuresObj.user_id,
              featuresObj.attributes);

          resolve(featuresObj);
        }).catch(function() {
          reject('Unable to instantiate the Optimizely client');
        });
      });
    },
  },
};

module.exports = methods;