#!/usr/bin/env node

'use strict';

const storjshare = require('xcore-daemon');
const dnode = require('dnode');
let api = new storjshare.RPC();

dnode(api.methods).listen(45015, () => {
  process.send({ state: 'init' });
});

process.on('uncaughtException', (err) => {
  console.log('RPC Server error: ', err);
  process.send({ error: err.stack }); //'A Fatal Exception has occured in the xcore-daemon RPC server'
});
