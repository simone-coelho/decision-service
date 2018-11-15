/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       server.js
 * Last Modified:   11/15/18 2:02 AM
 *
 */

'use strict';

const http = require('http');
const url = require('url');
const methods = require('./rpc/methods');
const types = require('./types/types');
const optimizely = require('./optimizely/optimizely_manager');

let server = http.createServer(requestListener);
const PORT = process.env.NODE_PORT || 9090;

//Initialize and get the datafile on server start
let appOptlyInstance;
optimizely.getInstance().then(optly => {
  appOptlyInstance = optly;
}).catch(function() {
  console.error('Unable to instantiate the Optimizely client');
});


/**
 *
 * @type {{"/rpc": (function(*=): Promise<any>), "/describe": (function(): Promise<any>)}}
 */
let routes = {
  // this is the rpc endpoint
  // every operation request will come through here
  '/rpc': function(body) {
    return new Promise((resolve, reject) => {
      let _json = JSON.parse(body); // might throw error
      let keys = Object.keys(_json);
      let promiseArr = [];

      if (!body) {
        response.statusCode = 400;
        response.end(JSON.stringify(
            {Message: `RPC request was expecting some data...!`}));
        return;
      }

      for (let key of keys) {
        if (methods[key] && typeof (methods[key].exec) === 'function') {
          let execPromise = methods[key].exec.call(null, _json[key]);
          if (!(execPromise instanceof Promise)) {
            throw new Error(`exec on ${key} did not return a promise`);
          }
          promiseArr.push(execPromise);
        } else {
          let execPromise = Promise.resolve({
            error: 'method is not defined',
          });
          promiseArr.push(execPromise);
        }
      }

      Promise.all(promiseArr).then(iter => {
        console.log(iter);
        let response = {};
        iter.forEach((val, index) => {
          response[keys[index]] = val;
        });

        resolve(response);
      }).catch(err => {
        reject('RPC method - ' + err);
      });
    });
  },

  // this is our docs endpoint
  // through this the clients should know
  // what methods and data types are available
  /**
   *
   * @returns {Promise<any>}
   */
  '/describe': function() {
    // load the type descriptions
    return new Promise(resolve => {
      let type = {};
      let method = {};

      // set types
      type = types;

      //set methods
      for (let m in methods) {
        method[m] = JSON.parse(JSON.stringify(methods[m]));
      }

      resolve({
        types: type,
        methods: method,
      });
    });
  },
};

// request Listener
// this is what we'll feed into http.createServer
/**
 *
 * @param request
 * @param response
 */
function requestListener(request, response) {
  let reqUrl = `http://${request.headers.host}${request.url}`;
  let parseUrl = url.parse(reqUrl, true);
  let pathname = parseUrl.pathname;

  // we're doing everything json
  response.setHeader('Content-Type', 'application/json');

  // buffer for incoming data
  let buf = null;

  // listen for incoming data
  request.on('data', data => {
    if (buf === null) {
      buf = data;
    } else {
      buf = buf + data;
    }
  });

  // on end proceed with compute
  request.on('end', () => {
    let body = buf !== null ? buf.toString() : null;

    if (routes[pathname]) {
      let compute = routes[pathname].call(null, body);

      if (!(compute instanceof Promise)) {
        // we're kinda expecting compute to be a promise
        // so if it isn't, just avoid it

        response.statusCode = 500;
        response.end(
            JSON.stringify({Message: 'Server error: Invalid Promise'}));
        console.warn('Whatever I got from the RPC was not a Promise!');
      } else {
        compute.then(res => {
          response.end(JSON.stringify(res));
        }).catch(err => {
          console.error(err);
          response.statusCode = 500;
          response.end(JSON.stringify({Message: 'Server error: ' + err}));
        });
      }

    } else {
      response.statusCode = 404;
      response.end(
          JSON.stringify({'Message': `Error: ${pathname} not found here`}));
    }
  });
}

console.log(`Starting the server on port ${PORT}`);
server.listen(PORT);