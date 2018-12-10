/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          datafile_manager
 * File Name:       server.js
 * Last Modified:   12/9/18 7:09 PM
 */

// server.js
'use strict';

const fs = require('fs');
const https = require('http');
const WebSocket = require('ws');
const fileStorage = require('./database/db');
const fileManager = require('./database/sdk_datafile');
const bodyParser = require('body-parser');
const validate = require('./utilities/json_validator');
const httpServer = new https.createServer();
const service = require('restana')({server: httpServer});
service.use(bodyParser.json());
const port = process.env.PORT || 2222;
const wss = new WebSocket.Server({server: httpServer});

let activeDatafileKeys;

if (process.env.DATAFILE_KEYS) {
  activeDatafileKeys = [process.env.DATAFILE_KEYS];
} else {
  activeDatafileKeys = [];
  //['CNPV5jgsCDgsDX4fgfAeWn', 'L7omXhmSV2Qa1DTbW2JeVB'];
}

wss.on('connection', function connection(ws, req) {
  const ip = req.connection.remoteAddress;

  ws.on('message', function incoming(message) {

    let messageObj = JSON.parse(message);
    switch (messageObj.type) {
      case 'get_sdk_keys':
        ws.send(JSON.stringify({type: 'active_sdk_keys', data: activeDatafileKeys}));
        console.log('Received message: %s', message);
        break;
      case 'get_datafiles':
        for (const key of activeDatafileKeys) {
          const datafile = fileStorage.datafiles.fetch(key);
          ws.send(
              JSON.stringify({type: 'active_datafile', data: datafile.datafile, id: key}));
          console.log('Sent an updated datafile to all clients: ' + key);
        }
        console.log('Received message: %s', message);
        break;
    }
  });
  ws.send(
      JSON.stringify({type: 'server_message', data: 'Hello from server to client on IP: ' + ip}));
});

// Broadcast to all.
wss.broadcast = function broadcast(message, data, id) {
  switch (message) {
    case 'active_sdk_keys':
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({type: 'active_sdk_keys', data: data}));
        }
      });
      console.log('Broadcast active datafile keys to all clients: ' + data);
      break;
    case 'active_datafiles':
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({type: 'active_datafile', data: data, id: id}));
          console.log('Sent an updated datafile to all clients: ' + id);
        }
      });
      break;
  }
};

service.start(port).then((server) => {
  console.log(`Starting the server on port ${port}`);
});

async function updateDatafiles(data, fullRefresh) {
  let validJSON = validate.update_sdk_keys(data);
  if (validJSON) {
    let keysArray = data.sdk_keys;
    if ((keysArray.constructor === Array) && (keysArray.length > 0)) {
      console.log('Received datafile_update request: ' + keysArray);
      let updateKeys = [];
      if ((activeDatafileKeys.length === 0) || (fullRefresh) ||
          (JSON.stringify(activeDatafileKeys) === JSON.stringify(keysArray))) {
        updateKeys = keysArray;
      } else {
        for (const key of keysArray) {
          updateKeys.push(key);
        }
      }

      if (fullRefresh) {
        fileStorage.datafiles.deleteList(activeDatafileKeys);
      }

      for (const key of updateKeys) {
        let datafile = await fileManager.downloadFileSync(key, true);
        wss.broadcast('active_datafiles', datafile, key);
      }

      activeDatafileKeys = fileManager.getAllDatafileKeys();
      //console.log(activeDatafileKeys);

      return ({status: 'success', updated_datafiles: keysArray});
    } else {
      return ({unregistered_keys: data});
    }
  } else {
    console.log('Received invalid datafile_update request: ' +
        validate.ajv.errorsText(validate.update_sdk_keys.errors));
    return ({status: 'error', message: validate.ajv.errorsText(validate.update_sdk_keys.errors)});
  }
}

// Http / Rest API
service.post('/datafile_update', async (req, res) => {
  let result = await updateDatafiles(req.body, false);
  res.send(result);
});

service.post('/datafile_full_refresh', async (req, res) => {
  let result = await updateDatafiles(req.body, true);
  res.send(result);
});

service.post('/update_sdk_keys', async (req, res) => {
  let validJSON = validate.update_sdk_keys(req.body);
  if (validJSON) {
    let keysArray = req.body.sdk_keys;
    if ((keysArray.constructor === Array) && (keysArray.length > 0)) {
      activeDatafileKeys = keysArray;
      console.log('Received update_sdk_keys request: ' + keysArray);
      wss.broadcast('active_sdk_keys', activeDatafileKeys, '');
      res.send({status: 'success', registered_keys: keysArray});
    } else {
      res.send({unregistered_keys: req.body});
    }
  } else {
    console.log('Received invalid update_sdk_keys request: ' +
        validate.ajv.errorsText(validate.update_sdk_keys.errors));
    res.send({status: 'error', message: validate.ajv.errorsText(validate.update_sdk_keys.errors)});
  }
});



