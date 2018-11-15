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
   * Track conversion events.
   * @param expObj
   *   Experiment JSON object.
   *   Refer to types.js for a description of the JSON schema definitions.
   * @returns {Promise<any>}
   *   Contains expObj with assigned variation.
   */
  experiment: {
    description: `activates the experiment, and returns the variation`,
    params: ['experiment: the experiment object'],
    returns: ['experiment object with variation key'],
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
   * @param trackObj
   *   Refer to types.js for a description of the JSON schema definition.
   * @returns {Promise<any>}
   *   Contains trackObj with acknowledgement message of success or failure.
   */
  track: {
    description: `track a conversion event`,
    params: ['track: the track event object'],
    returns: ['track event object with acknowledgement'],
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
   * Activate a feature test or check for enabled feature rollouts.
   * @param featuresObj
   *   Refer to types.js for a description of the JSON schema definition.
   * @returns {Promise<any>}
   *   Contains featuresObj and all enabled features and variable values if defined.
   */
  features: {
    description: `activates a feature rollout or feature test and returns variable values if any`,
    params: [],
    returns: ['features object'],
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
            ;
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
   * @param taskObj
   * @returns {Promise<any | never>}
   */
  task: {
    description: `creates a new task, and returns the details of the new task`,
    params: ['task: the task object'],
    returns: ['task'],
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
      }).catch(function() {
        reject('Unable to initialize the specified task');
      });
    },
  },
};

module.exports = methods;