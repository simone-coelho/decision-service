/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       utils.js
 * Last Modified:   11/17/18 4:28 AM
 *
 */

const fs = require('fs');
const _placeHolder = require('string-placeholder');
const config = require('../configuration/config');
const sdk = config.sdk;

module.exports = {

  validURL: function(str) {
    const pattern = new RegExp('^(https?:\/\/)?' + // protocol
        '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|' + // domain name
        '((\d{1,3}\.){3}\d{1,3}))' + // OR ip (v4) address
        '(\:\d+)?(\/[-a-z\d%_.~+]*)*' + // port and path
        '(\?[;&a-z\d%_.~+=-]*)?' + // query string
        '(\#[-a-z\d_]*)?$', 'i'); // fragment locator

    return pattern.test(str);
  },

  extraxctFileFromUrl: function(url) {
    if ((url) && (url !== '')) {
      return url.substring(url.lastIndexOf('/') + 1);
    }
  },

  coalesceUserAttr: function(userAttributes) {
    return Object.assign(sdk.GLOBAL_ATTRIBUTES, userAttributes || {});
  }
  ,
  /**
   *
   * @param str
   * @param data
   * @param options
   * @returns {String}
   */
  placeHolder: function(str, data, options) {
    return _placeHolder(str, data, options);
  }
  ,

  /**
   * Reads a file from disk.
   *
   * @param path
   * @param options
   * @returns {Promise<object>}
   */
  readFile: function(path, options = 'utf8') {
    return new Promise((resolve, reject) => {
      fs.readFile(path, options
          , (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
    });
  }
  ,

  /**
   * Writes a file to disk.
   *
   * @param path
   * @param data
   * @param options
   * @returns {Promise<string>}
   */
  writeFile: (path, data, options = 'utf8') => {
    //noinspection JSIgnoredPromiseFromCall
    new Promise((resolve, reject) => {
      fs.writeFile(path, data, options, (err) => {
        if (err) reject(err);
        else resolve('File successfully saved: ' + path);
      });
    });

  },
}
;