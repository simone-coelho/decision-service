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
      variation_key: ['string', 'returned variation key'],
      project_id: ['string', 'optional [currently not implemented]'],
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
        'optional - if variation is needed in response'],
      variation_key: ['string', 'returns variation key'],
      is_enabled: ['boolean', 'returned "true" if feature is enabled'],
      feature_config: ['object', 'returns feature variable values'],
    },
  },
  track: {
    description: 'the details of the track conversion event',
    props: {
      event_key: ['string', 'required'],
      user_id: ['string', 'required'],
      attributes: ['object', 'optional but must include empty object'],
      tags: ['array of objects', 'optional'],
      acknowledgement: ['string', 'returned conversion result'],
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