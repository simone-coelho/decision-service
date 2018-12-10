/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          datafile_manager
 * File Name:       json_schemas.js
 * Last Modified:   12/9/18 7:11 PM
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