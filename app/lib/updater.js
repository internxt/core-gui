'use strict';

const about = require('../package');
const { EventEmitter } = require('events');
// const request = require('request');
const assert = require('assert');
const semver = require('semver');
const fetch = require('node-fetch');

const installerExtension = new Map([
  ['win32', 'exe'],
  ['darwin', 'dmg'],
  ['linux', 'deb']
]);

class Updater extends EventEmitter {

  constructor() {
    super();
  }

  /**
   * Fetches remote package metadata and determines if update is available
   */
  checkForUpdates() {
    const currentVersion = semver.valid(about.version);

    this._checkGithubUpdates().then(res => {
      const latestVersion = semver.valid(res.tag_name);

      if (semver.gt(latestVersion, currentVersion)) {
        // There is a new version of the app.
        // Now check if the current platform is supported.

        const currentPlatform = process.platform;

        var result = res.assets.filter(value => {
          return value.name.endsWith(installerExtension.get(currentPlatform));
        });

        if (result && result.length === 1) {
          const updateAvailable = {
            url: result[0].browser_download_url,
            version: latestVersion
          };
          this.emit('new-update', updateAvailable);
        } else {
          this.emit('no-updates');
        }
      }

    }).catch(err => {
      this.emit('error', err);
    });
  }

  _checkGithubUpdates() {
    return new Promise((resolve, reject) => {
      fetch('https://api.github.com/repos/internxt/x-core/releases/latest')
        .then(res => res.json())
        .then(res => { resolve(this._validateResponse(res)); })
        .catch(err => { reject(err); });
    });
  }

  /**
   * Validates the response body from version check
   * @param {Object} body
   */
  _validateResponse(body) {
    assert(typeof body === 'object');
    assert(typeof body.html_url === 'string');
    assert(typeof body.tag_name === 'string');
    return body;
  }

}

module.exports = Updater;
