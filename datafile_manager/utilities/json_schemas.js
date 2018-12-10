/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       json_schemas.js
 * Last Modified:   12/8/18 1:07 PM
 *
 */

/**
 * JSON Schema Definitions
 * Used to validate the objects passed in as parameters.
 */
const schemas = {
  update_sdk_keys: {
    'properties': {
      'sdk_keys': {
        'type': 'array',
        'items': {
          'type': 'string',
        },
        'minItems': 1,
        'uniqueItems': true,
      },
    },
  },
};

module.exports = schemas;