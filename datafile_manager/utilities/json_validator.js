/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          datafile_manager
 * File Name:       json_validator.js
 * Last Modified:   12/9/18 7:19 PM
 */

const schemas = require('./json_schemas');
const Ajv = require('ajv');
const ajv = new Ajv({
                        allErrors: true, useDefaults: true
                    });

/**
 * JSON Object Schema Validators
 *
 */
let validators = {
    update_sdk_keys: ajv.compile(schemas.update_sdk_keys), ajv: ajv
};

module.exports = validators;