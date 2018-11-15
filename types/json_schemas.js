/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       json_schemas.js
 * Last Modified:   11/15/18 2:23 AM
 *
 */

const schemas = {
  /**
   *
   */
  experiments: {
    'type': 'object',
    'properties': {
      'experiment_key': {
        'type': 'string',
      },
      'user_id': {
        'type': 'string',
      },
      'attributes': {
        'type': 'object',
        'default': {},
        'patternProperties': {
          '^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$_={}<>?:;|[]': {
            'type': ['integer', 'string', 'number', 'boolean', 'null'],
          },
        },
      },
      'variation_key': {
        'type': 'string',
        'default': '',
      },
    },
    'required': [
      'experiment_key',
      'user_id',
    ],
  },

  /**
   *
   */
  features: {
    'type': 'object',
    'properties': {
      'feature_key': {
        'type': 'string',
      },
      'user_id': {
        'type': 'string',
      },
      'attributes': {
        'type': 'object',
        'default': {},
        'patternProperties': {
          '^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$_={}<>?:;|[]': {
            'type': ['integer', 'string', 'number', 'boolean', 'null'],
          },
        },
      },
      'is_enabled': {
        'type': 'boolean',
        'default': false,
      },
      'variation_key': {
        'type': 'string',
        'default': '',
      },
      'feature_config': {
        'type': 'object',
        'default': {},
        'patternProperties': {
          '^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$_={}<>?:;|[]': {
            'type': 'string',
            'enum': ['string', 'boolean', 'double', 'integer'],
          },
        },
      },
    },
    'required': [
      'feature_key',
      'user_id',
    ],
  },

  /**
   *
   */
  feature_test: {
    'type': 'object',
    'properties': {
      'feature_key': {
        'type': 'string',
      },
      'user_id': {
        'type': 'string',
      },
      'attributes': {
        'type': 'object',
        'default': {},
        'patternProperties': {
          '^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$_={}<>?:;|[]': {
            'type': ['integer', 'string', 'number', 'boolean', 'null'],
          },
        },
      },
      'feature_test_key': {
        'type': 'string',
        'default': '',
      },
      'variation_key': {
        'type': 'string',
        'default': '',
      },
      'is_enabled': {
        'type': 'boolean',
        'default': false,
      },
      'feature_config': {
        'type': 'object',
        'default': {},
        'patternProperties': {
          '^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$_={}<>?:;|[]': {
            'type': 'string',
            'enum': ['string', 'boolean', 'double', 'integer'],
          },
        },
      },
    },
    'required': [
      'feature_key',
      'user_id',
    ],
  },

  /**
   *
   */
  track: {
    'type': 'object',
    'properties': {
      'event_key': {
        'type': 'string',
      },
      'user_id': {
        'type': 'string',
      },
      'attributes': {
        'type': 'object',
        'default': {},
        'patternProperties': {
          '^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$_={}<>?:;|[]': {
            'type': ['integer', 'string', 'number', 'boolean', 'null'],
          },
        },
      },
      'tags': {
        'type': 'object',
        'default': {},
        'patternProperties': {
          '^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$_={}<>?:;|[]': {
            'type': ['integer', 'string', 'number', 'boolean', 'null'],
          },
        },
      },
      'acknowledgement': {
        'type': 'string',
        'default': '',
      },
    },
    'required': [
      'event_key',
      'user_id',
    ],
  },

};

module.exports = schemas;