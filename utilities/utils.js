/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       utils.js
 * Last Modified:   11/15/18 1:06 AM
 *
 */

const fs = require('fs');
const _placeHolder = require('string-placeholder');

module.exports = {

  /**
   *
   * @param str
   * @param data
   * @param options
   * @returns {String}
   */
  placeHolder: function(str, data, options) {
    return _placeHolder(str, data, options);
  },

  /**
   * Reads a file from disk.
   *
   * @param path
   * @param options
   * @returns {Promise<any>}
   */
  readFile: function(path, options = 'utf8') {
    return new Promise((resolve, reject) => {
      fs.readFile(path, options
          , (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
    });
  },

  /**
   * Writes a datafile to disk.
   *
   * @param path
   * @param data
   * @param options
   * @returns {Promise<any>}
   */
  writeFile: (path, data, options = 'utf8') => {
    //noinspection JSIgnoredPromiseFromCall
    new Promise((resolve, reject) => {
      fs.writeFile(path, data, options, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

  },
};