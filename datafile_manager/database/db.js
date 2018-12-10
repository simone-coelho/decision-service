/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          datafile_manager
 * File Name:       db.js
 * Last Modified:   12/9/18 6:39 PM
 */

'use strict';

let datafiles = {};
let users = {};
let tasks = {};

// we are saving everything in memory for now
let db = {
  datafiles: proc(datafiles),
  users: proc(users),
  tasks: proc(tasks),
};

function clone(obj) {
  // a simple way to deep clone an object in javascript
  return JSON.parse(JSON.stringify(obj));
}

// a generalised function to handles CRUD operations
/**
 *
 * @param container
 * @returns {*}
 */
function proc(container) {
  return {
    save(obj) {
      // in JS, objects are passed by reference
      // so to avoid interfering with the original data
      // we deep clone the object, to get our own reference
      //let _obj = clone(obj);
      let _obj = obj;
      // console.log('saving', _obj);
      if (!_obj.id) {
        // assign a random number as ID if none exists
        _obj.id = (Math.random() * 10000000) | 0;
      }

      container[_obj.id.toString()] = _obj;
      //return clone(_obj);
      return _obj;
    },
    fetch(id) {
      // deep clone this so that nobody modifies the db by mistake from outside
      //let result = clone(container[id.toString()]);
      return container[id.toString()];
    },
    fetchAll() {
      let _bunch = [];
      for (let item in container) {
        //_bunch.push(clone(container[item]));
        _bunch.push(container[item]);
      }
      return _bunch;
    },
    deleteList(itemList) {
      for (let item of itemList) {
        delete container[item];
      }
      return container.length;
    },
    delete(id) {
      delete container[id];
    },
  };
}

module.exports = db;