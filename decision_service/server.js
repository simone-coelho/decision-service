/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       server.js
 * Last Modified:   12/9/18 3:13 AM
 *
 */
'use strict';

const http = require('http');
const url = require('url');
const methods = require('./rpc/methods');
const types = require('./types/types');
const server_config = require('./configuration/config');
const PORT = server_config.server.NODE_PORT;
http.createServer(requestListener).listen(PORT);


let routes = {
  /**
   * Defines the different url paths that our application will respond to. This is
   * the RPC endpoint and every operation/method request will come through here.
   *
   * @param body
   *   The JSON object in the request body that represents an individual function or method.
   * @returns {Promise<object>}
   *   Original JSON object with corresponding result(s) appended.
   */
  '/rpc': function(body) {

    return new Promise((resolve, reject) => {
      let _json = JSON.parse(body); // might throw error
      let keys = Object.keys(_json);
      let promiseArr = [];
      //console.log('Got to rpc');
      if (!body) {
        response.statusCode = 400;
        //noinspection
        // NodeModulesDependencies,NodeModulesDependencies,ES6ModulesDependencies,JSUnresolvedFunction
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
        //console.log(iter);
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


  /**
   * Describe endpoint, scans through the descriptions of both the methods
   * and the data types, and returns that information in the response.
   *
   * @returns {Promise<object>}
   *   JSON Object with the descriptions for all the methods supported.
   */
  '/describe': function() {
    // load the type descriptions
    return new Promise(resolve => {
      let type;
      let method = {};
      console.log('Got to describe');

      // set types
      type = types;

      // set methods
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


/**
 * This function is called every time there is a new request, we wait on the data
 * coming in, after which, we look at the path, and match it to a handler on the routing table.
 *
 * @param request
 * @param response
 */
function requestListener(request, response) {
  let reqUrl = `http://${request.headers.host}${request.url}`;
  let parseUrl = url.parse(reqUrl, true);
  let pathname = parseUrl.pathname;

  // we're doing everything as json
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
