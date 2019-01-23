/*
 *
 *  * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *  *
 *  * Module:          datafile_service
 *  * File Name:       server.js
 *  * Last Modified:   12/13/18 3:02 PM
 *
 */

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

// Array list of all available datafile keys.
let activeDatafileKeys;

/**
 * If "activeDatafileKeys" is defined on server start it will attempt to download
 * and cache the specified datafiles immediately and push them via websockets to
 * all connected clients.
 */
if (process.env.DATAFILE_KEYS) {
    activeDatafileKeys = [process.env.DATAFILE_KEYS];
} else {
    //activeDatafileKeys = [];
    activeDatafileKeys = ['CNPV5jgsCDgsDX4fgfAeWn', 'L7omXhmSV2Qa1DTbW2JeVB'];
}

function noop() {}

function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', function connection(ws) {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping(noop);
    });
}, 30000);

/**
 * Websockets message handler for individual connections.
 */
wss.on('connection', function connection (ws, req) {
    const ip = req.connection.remoteAddress;

    ws.on('message', function incoming (message) {

        let messageObj = JSON.parse(message);
        switch (messageObj.type) {
            // Returns a list of all cached and active datafile keys.
            case 'get_sdk_keys':
                ws.send(JSON.stringify(
                    {type: 'active_sdk_keys', data: activeDatafileKeys}));
                console.log('Received message: %s', message);
                break;
            // Returns all of the cached JSON datafiles one at a time.
            case 'get_datafiles':
                if (activeDatafileKeys.length === 0) {
                    ws.send(JSON.stringify({
                                               type: 'server_message',
                                               data: 'Websocket server does not have any registered datafiles.'
                                           }));
                } else {
                    for (const key of activeDatafileKeys) {
                        const datafile = fileStorage.datafiles.fetch(key);
                        ws.send(JSON.stringify({
                                                   type: 'active_datafile',
                                                   data: datafile.datafile_json,
                                                   id: key
                                               }));
                        console.log(
                            'Sent an updated datafile to all clients: ' + key);
                    }
                }
                console.log('Received message: %s', message);
                break;
        }
    });
    ws.send(JSON.stringify({
                               type: 'server_message',
                               data: 'Hello from server to client on IP: ' + ip
                           }));
});

/**
 * Helper function to broadcast to all connected clients.
 *
 * @param message
 *   The name of the message or type of message.
 * @param data
 *   Data to be sent.
 * @param id
 *   Identifier for the message.
 */
wss.broadcast = function broadcast (message, data, id) {
    switch (message) {
        // Sends a list of active datafile key(s) to all connected clients.
        case 'active_sdk_keys':
            wss.clients.forEach(function each (client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(
                        JSON.stringify({type: 'active_sdk_keys', data: data}));
                }
            });
            console.log(
                'Broadcast active datafile keys to all clients: ' + data);
            break;
        // Sends an individual JSON datafile to all connected clients.
        case 'active_datafiles':
            wss.clients.forEach(function each (client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(
                        {type: 'active_datafile', data: data, id: id}));
                    console.log(
                        'Sent an updated datafile to all clients: ' + id);
                }
            });
            break;
    }
};

/**
 * Updates the local file storage with new datafiles specified by the array of
 * datafile keys passed in the data parameter. It also broadcasts or pushes the
 * new JSON datafiles to all connected clients via websockets.
 *
 * @param data
 *   JSON object from a websocket message or http body payload.
 * @param fullRefresh
 *   Determines if the cached local storage should be cleared completely.
 * @returns {Promise<object>}
 *   JSON object websocket message.
 */
async function updateDatafiles (data, fullRefresh) {
    let validJSON = validate.update_sdk_keys(data);
    if (validJSON) {
        let keysArray = data.sdk_keys;
        if ((keysArray.constructor === Array) && (keysArray.length > 0)) {
            console.log('Received datafile_update request: ' + keysArray);
            let updateKeys = [];
            if ((activeDatafileKeys.length === 0) || (fullRefresh) ||
                (JSON.stringify(activeDatafileKeys) ===
                    JSON.stringify(keysArray))) {
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
                        validate.ajv.errorsText(
                            validate.update_sdk_keys.errors));
        return ({
            status: 'error',
            message: validate.ajv.errorsText(validate.update_sdk_keys.errors)
        });
    }
}

/**
 * Downloads a datafile from the CDN and updates or adds a single datafile in
 * local storage.
 *
 * @param key
 *   Datafile SDK key for the file that needs to be updated.
 * @returns {Promise<object>}
 */
async function updateDatafile (key) {
    let datafile = await fileManager.downloadFileSync(key, true);
    activeDatafileKeys = fileManager.getAllDatafileKeys();
    return datafile;
}

// Http and Rest API

/**
 * "datafile_update" endpoint responsible for adding or updating a datfile(s) to/in
 * the cached local storage from the JSON array of datafile keys contained in the
 * body payload. This does not remove datafiles that are not included in the input array.
 *
 * Once the local storage is update it will push the new files via websockets to
 * all connected clients.
 */
service.post('/datafile_update', async (req, res) => {
    let result = await updateDatafiles(req.body, false);
    res.send(result);
});

/**
 * "datafile_full_refresh" endpoint responsible for adding the files contained in
 * the cached local storage from the JSON array of datafile keys contained in the
 * body payload. This clears all datafiles in the storage prior to adding any new
 * files contained in the input array of datafile keys.
 *
 * Once the local storage is update it will push the new files via websockets to
 * all connected clients.
 */
service.post('/datafile_full_refresh', async (req, res) => {
    let result = await updateDatafiles(req.body, true);
    res.send(result);
});

/**
 * "update_sdk_keys" endpoint responsible for notifying all connected clients of
 * updated or newly added datafile keys. Connected clients will then download
 * the updated files from the preconfigured CDN or from this server.
 */
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
                        validate.ajv.errorsText(
                            validate.update_sdk_keys.errors));
        res.send({
                     status: 'error',
                     message: validate.ajv.errorsText(
                         validate.update_sdk_keys.errors)
                 });
    }
});

/**
 * "/datafile/json/:datafile_key" endpoint responsible for returning a specific
 * datafile from the key parameter. If the file exists in local storage that file
 * will be returned. If the specified datafile is not found it will be retrieved
 * from the preconfigured CDN, saved to local storage and returned to the client.
 */
service.get('/datafile/json/:datafile_key', async (req, res) => {
    let datafile = await fileStorage.datafiles.fetch(req.params.datafile_key);

    if (!datafile) {
        datafile = {};
        datafile.datafile_json = await updateDatafile(req.params.datafile_key);
    }

    if (datafile) {
        res.send(JSON.stringify(datafile.datafile_json));
        console.log('Sent datafile from cache storage to client ' +
                        req.connection.remoteAddress + ':' +
                        req.connection.remotePort + ' - ' +
                        req.params.datafile_key);
    } else {
        res.send(JSON.stringify({
                                    status: 'failed',
                                    message: 'The specified SDK datafile key is not registered in this server.'
                                }));
    }
});

// Start the server.
// ToDo Add "/" for health check
service.start(port).then((server) => {
    console.log(`Starting the server on port ${port}`);
    if (activeDatafileKeys.length > 0) {
        let _keys = {sdk_keys: activeDatafileKeys};
        updateDatafiles(_keys);
    }
});

