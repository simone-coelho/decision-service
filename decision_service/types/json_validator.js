/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       json_validator.js
 * Last Modified:   11/18/18 3:05 AM
 *
 */

const schemas = require('./json_schemas');
const Ajv = require('ajv');
const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
});

/**
 * JSON Object Schema Validators
 *
 * @type {{experiments:ajv.ValidateFunction,
 * features:ajv.ValidateFunction,
 * feature_test:ajv.ValidateFunction,
 * track:ajv.ValidateFunction, ajv:ajv | ajv.Ajv}}
 */
let validators = {
  experiments: ajv.compile(schemas.experiments),
  features: ajv.compile(schemas.features),
  feature_test: ajv.compile(schemas.feature_test),
  track: ajv.compile(schemas.track),
  enabled_features: ajv.compile(schemas.enabled_features),
  get_variation: ajv.compile(schemas.get_variation),
  set_variation: ajv.compile(schemas.set_variation),
  ajv: ajv,
};

module.exports = validators;