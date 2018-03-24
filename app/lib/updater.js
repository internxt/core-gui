'use strict';

const about = require('../package');
const {EventEmitter} = require('events');
const request = require('request');
const assert = require('assert');
const semver = require('semver');

class Updater extends EventEmitter {

  constructor() {
    super();
  }

  /**
   * Fetches remote package metadata and determines if update is available
   */
  checkForUpdates() {
  }

  /**
   * Validates the response body from version check
   * @param {Object} body
   */
  _validateResponse(body) {
    assert(typeof body === 'object');
    assert(typeof body.html_url === 'string');
    assert(typeof body.tag_name === 'string');
  }

}

module.exports = new Updater();
