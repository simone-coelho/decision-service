/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       json_validator.js
 * Last Modified:   12/8/18 1:06 PM
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
 */
let validators = {
  update_sdk_keys: ajv.compile(schemas.update_sdk_keys),
  ajv: ajv,
};

module.exports = validators;