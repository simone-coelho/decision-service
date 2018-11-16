/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       types.js
 * Last Modified:   11/15/18 1:37 AM
 *
 */

'use strict';

let types = {
  experiment: {
    description: 'the details of the experiment',
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
    description: 'the details of a feature test',
    props: {
      feature_key: ['string', 'required'],
      user_id: ['string', 'required'],
      attributes: ['object', 'optional'],
      feature_test_key: [
        'string',
        'optional - returns feature test key if feature is in a test'],
      variation_key: ['string', 'returns variation key for the feature test'],
      is_enabled: ['boolean', 'returns "true" if feature is enabled'],
      feature_config: ['object', 'returns feature variable values'],
    },
  },
  track: {
    description: 'the details of the track conversion event',
    props: {
      event_key: ['string', 'required'],
      user_id: ['string', 'required'],
      attributes: ['object', 'optional'],
      tags: ['array of objects', 'optional'],
      acknowledgement: ['string', 'returns "success" or error message'],
    },
  },
  task: {
    description: 'a task entered by the client to do at a later time',
    props: {
      user_id: ['number', 'required'],
      content: ['string', 'require'],
      expire: ['date', 'required'],
    },
  },
};

module.exports = types;