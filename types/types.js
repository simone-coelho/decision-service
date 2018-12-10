/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       types.js
 * Last Modified:   12/7/18 11:17 PM
 *
 */

'use strict';

let types = {
  experiment: {
    description: 'Activates an A/B test for a user, deciding whether they qualify for the experimen',
    props: {
      experiment_key: ['string', 'required'],
      user_id: ['string', 'required'],
      attributes: ['object', 'optional'],
      variation_key: ['string', 'returns the variation key assigned'],
      project_id: ['string', 'optional [currently not implemented]'],
      datafile_url: ['string', 'optional [currently not implemented]'],
      datafile_key: ['string', 'optional [currently not implemented]'],
    },
  },
  features: {
    description: 'Determines whether a feature test or rollout is enabled for a given user',
    props: {
      feature_key: ['string', 'required'],
      user_id: ['string', 'required'],
      attributes: ['object', 'optional'],
      feature_test_key: ['string', 'optional - returns feature test key if feature is in a test'],
      variation_key: ['string', 'returns variation key for the feature test'],
      project_id: ['string', 'optional [currently not implemented]'],
      datafile_url: ['string', 'optional [currently not implemented]'],
      datafile_key: ['string', 'optional [currently not implemented]'],
      is_enabled: ['boolean', 'returns "true" if feature is enabled'],
      feature_config: [
        'object',
        'returns feature variable values for feature test or flags (rollouts)'],
    },
  },
  get_variation: {
    description: 'Returns the experiment or feature test variation that a visitor would qualify for',
    props: {
      experiment_key: ['string', 'required (experiment or feature test key)'],
      user_id: ['string', 'required'],
      attributes: ['object', 'optional'],
      variation_key: ['string', 'returns the variation key assigned'],
      project_id: ['string', 'optional [currently not implemented]'],
      datafile_url: ['string', 'optional [currently not implemented]'],
      datafile_key: ['string', 'optional [currently not implemented]'],
    },
  },
  set_forced_variation: {
    description: 'Forces a user into a variation for a given experiment or feature test',
    props: {
      experiment_key: ['string', 'required'],
      user_id: ['string', 'required'],
      variation_key: ['string', 'required (variation to force visitor into)'],
      project_id: ['string', 'optional [currently not implemented]'],
      datafile_url: ['string', 'optional [currently not implemented]'],
      datafile_key: ['string', 'optional [currently not implemented]'],
    },
  },
  get_forced_variation: {
    description: 'Returns the variation that the user has been forced into',
    props: {
      experiment_key: ['string', 'required'],
      user_id: ['string', 'required'],
      variation_key: ['string', 'returns the variation key assigned'],
      project_id: ['string', 'optional [currently not implemented]'],
      datafile_url: ['string', 'optional [currently not implemented]'],
      datafile_key: ['string', 'optional [currently not implemented]'],
    },
  },
  track: {
    description: 'Track conversion events across multiple experiments',
    props: {
      event_key: ['string', 'required'],
      user_id: ['string', 'required'],
      attributes: ['object', 'optional'],
      tags: ['array of objects', 'optional'],
      project_id: ['string', 'optional [currently not implemented]'],
      datafile_url: ['string', 'optional [currently not implemented]'],
      datafile_key: ['string', 'optional [currently not implemented]'],
      acknowledgement: ['string', 'returns "success" or error message'],
    },
  },
  get_enabled_features: {
    description: 'Returns an array list of all the features that are enabled for the user',
    props: {
      user_id: ['string', 'required'],
      attributes: ['object', 'optional'],
      features_list: ['array', 'returns list of enabled features'],
      project_id: ['string', 'optional [currently not implemented]'],
      datafile_url: ['string', 'optional [currently not implemented]'],
      datafile_key: ['string', 'optional [currently not implemented]'],
    },
  },
  task: {
    description: 'A task entered by the client to do at a later time',
    props: {
      user_id: ['number', 'required'],
      content: ['string', 'require'],
      expire: ['date', 'required'],
    },
  },
};

module.exports = types;