'use strict';

const fs = require('fs');
const path = require('path');
const { homedir } = require('os');
const prettyms = require('pretty-ms');
const storjshare = require('xcore-daemon');
const storj = require('storj-lib');
const mkdirPSync = require('../lib/mkdirpsync');
const stripComments = require('strip-json-comments');
const filter = require('../views/components/filters/metrics.js');
const rpc = window.daemonRpc;
const defaultConfig = fs.readFileSync(
  path.join(__dirname, 'schema.json')
).toString();


class Share {
  constructor() {
    this.errors = [];
    this.actions = {};
    this.config;
    this.storageAvailable = 0;

    this.actions.createShareConfig = () => {
      let returnedPath = false;
      let configFileDescriptor;
      let storPath;
      this.config.networkPrivateKey = storj.KeyPair().getPrivateKey();
      let nodeID = storj.KeyPair(this.config.networkPrivateKey).getNodeID();
      let sharePath = path.join(homedir(), '.xcore/shares');

      if (this.config.storagePath === undefined || this.config.storagePath === '') {
        storPath = path.join(sharePath, '/', nodeID);
      } else {
        storPath = path.join(this.config.storagePath, '/');
      }

      this.config.storagePath = storPath;

      if (this.config.storageAllocation &&
        !this.config.storageAllocation.toString().match(
          /[0-9]+([Tt]|[Mm]|[Gg]|[Kk])?[Bb]/g
        )) {
        this.config.storageAllocation = this.config.storageAllocation.toString() + 'MB';
      }

      let logPath = path.join(homedir(), '.xcore/logs');
      let configPath = path.join(homedir(), '.xcore/configs');

      try {
        mkdirPSync(sharePath);
        mkdirPSync(logPath);
        mkdirPSync(configPath);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          this.errors.push(err);
        }
      }

      this.config.loggerOutputFile = logPath;
      configPath = path.join(configPath, '/') + nodeID + '.json';

      let configArray = JSON.stringify(this.config, null, 2).split("\n");
      let defaultConfigArray = defaultConfig.split("\n");
      let rawConfigIndex = 0;

      // Restores comments
      for (let i = 0; i < defaultConfigArray.length - 1; i++ , rawConfigIndex++) {
        if (defaultConfigArray[i].trim().startsWith("//")) {
          configArray.splice(rawConfigIndex, 0, defaultConfigArray[i]);
        }
      }

      let configBuffer = Buffer.from(configArray.join("\n"));

      try {
        storjshare.utils.validate(this.config);
        configFileDescriptor = fs.openSync(configPath, 'w');
        fs.writeFileSync(configFileDescriptor, configBuffer);
        returnedPath = configPath;
      } catch (err) {
        this.errors.push(err);
      } finally {
        if (configFileDescriptor) {
          fs.closeSync(configFileDescriptor);
        }

        if (returnedPath) {
          this.config = {};
        }

        return returnedPath;
      }
    };

    this.actions.clearErrors = () => {
      this.errors = [];
    };

    this.actions.reset = () => {
      this.config = new Proxy(JSON.parse(stripComments(defaultConfig)), this._validator());
      this.actions.clearErrors();
    };

    this.actions.getFreeDiskSpace = (path, callback) => {
      storjshare.utils.getFreeSpace(path, (err, free) => {
        if (err) {
          this.errors.push(err);
          return callback(err);
        }
        this.storageAvailable = free;
        return callback(null, free);
      });
    };

    this.actions.reset();
  }

  _validator() {
    return {
      set: function (obj, prop, val) {
        let isValid = true;
        let propVal;

        if (typeof obj[prop] === 'undefined') {
          isValid = false;
        }

        switch (prop) {
          case 'rpcPort':
            propVal = Number(String(val).replace(/\d+/g, '$&'));
            break;
          default:
            propVal = val;
            break;
        }

        if (isValid) {
          obj[prop] = propVal;
        }

        return isValid;
      }
    };
  }
}

module.exports = Share;
