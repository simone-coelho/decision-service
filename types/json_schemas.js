/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       json_schemas.js
 * Last Modified:   12/8/18 12:47 AM
 *
 */

/**
 * JSON Schema Definitions
 * Used to validate the RPC method objects passed in as parameters.
 */
const schemas = {
  shared: {
    'attributes': {
      'type': 'object',
      'default': {},
      'patternProperties': {
        '^[a-zA-Z0-9!@#$&()\\-`.+,/"]*$_={}<>?:;|[]': {
          'type': ['integer', 'string', 'number', 'boolean', 'null'],
        },
      },
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

  experiments: {
    'type': 'object',
    'properties': {
      'experiment_key': {
        'type': 'string',
      },
      'user_id': {
        'type': 'string',
      },
      get attributes() {
        return schemas.shared.attributes;
      },
      'variation_key': {
        'type': 'string',
        'default': '',
      },
      'datafile_key': {
        'type': 'string',
      },
    },
    'required': [
      'experiment_key',
      'user_id',
      'datafile_key',
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
      get attributes() {
        return schemas.shared.attributes;
      },
      'is_enabled': {
        'type': 'boolean',
        'default': false,
      },
      'variation_key': {
        'type': 'string',
        'default': '',
      },
      'datafile_key': {
        'type': 'string',
      },
      get feature_config() {
        return schemas.shared.feature_config;
      },
    },
    'required': [
      'feature_key',
      'user_id',
      'datafile_key',
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
      get attributes() {
        return schemas.shared.attributes;
      },
      'feature_test_key': {
        'type': 'string',
        'default': '',
      },
      'variation_key': {
        'type': 'string',
        'default': '',
      },
      'datafile_key': {
        'type': 'string',
      },
      'is_enabled': {
        'type': 'boolean',
        'default': false,
      },
      get feature_config() {
        return schemas.shared.feature_config;
      },
    },
    'required': [
      'feature_key',
      'user_id',
      'datafile_key',
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
      get attributes() {
        return schemas.shared.attributes;
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
      'datafile_key': {
        'type': 'string',
      },
      'acknowledgement': {
        'type': 'string',
        'default': '',
      },
    },
    'required': [
      'event_key',
      'user_id',
      'datafile_key',
    ],
  },

  set_variation: {
    'type': 'object',
    'properties': {
      'experiment_key': {
        'type': 'string',
      },
      'user_id': {
        'type': 'string',
      },
      'variation_key': {
        'type': 'string',
        'default': '',
      },
      'datafile_key': {
        'type': 'string',
      },
    },
    'required': [
      'experiment_key',
      'user_id',
      'variation_key',
      'datafile_key',
    ],
  },

  get_variation: {
    'type': 'object',
    'properties': {
      'experiment_key': {
        'type': 'string',
      },
      'user_id': {
        'type': 'string',
      },
      get attributes() {
        return schemas.shared.attributes;
      },
      'datafile_key': {
        'type': 'string',
      },
    },
    'required': [
      'experiment_key',
      'user_id',
      'datafile_key',
    ],
  },

  enabled_features: {
    'type': 'object',
    'properties': {
      'user_id': {
        'type': 'string',
      },
      get attributes() {
        return schemas.shared.attributes;
      },
      'datafile_key': {
        'type': 'string',
      },
    },
    'required': [
      'user_id',
      'datafile_key',
    ],
  },

};

module.exports = schemas;