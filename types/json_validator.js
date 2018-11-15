/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       json_validator.js
 * Last Modified:   11/14/18 8:23 PM
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
  ajv: ajv,
};

module.exports = validators;