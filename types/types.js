'use strict';

let types = {
  experiment: {
    description: 'the details of the experiment',
    props: {
      experiment_key: ['string', 'required'],
      user_id: ['string', 'required'],
      attributes: ['object', 'optional but must include empty object'],
      variation_key: ['string', 'returned variation key'],
      project_id: ['string', 'optional'],
    },
  },
  features: {
    description: 'the details of a feature test',
    props: {
      feature_key: ['string', 'required'],
      user_id: ['string', 'required'],
      attributes: ['object', 'optional but must include empty object'],
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
      tags: ['array of objects', 'optional but must include empty object'],
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