/*
 * Copyright (c) 2018, Simone A. Coelho - Optimizely
 *
 * Module:          ds_rpc
 * File Name:       app.js
 * Last Modified:   12/9/18 3:28 AM
 *
 */

// Todo - Destroy and respawn workers periodically

let cluster = require('cluster');

if (cluster.isMaster) {
  let cpus = require('os').cpus().length;
  for (let i = 0; i < cpus; i += 1) {
    cluster.fork();
  }
  cluster.on('exit', function(worker) {
    console.log(`worker ${worker.id} exited, respawning...`);
    cluster.fork();
  });
} else {
  require('./server.js');
  console.log(`worker ${cluster.worker.id} fas been forked.`);
}
