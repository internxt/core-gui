'use strict'

const packager = require('electron-packager')
const installer = require('electron-installer-windows');
const appInfo = require('../app/package.json')

const options = {
  src: 'dist/X Core-win32-x64',
  dest: 'releases/win32/installers'
}

function create_package() {
  return packager({
    name: appInfo.productName,
    appBundleId: appInfo.identifier,
    appVersion: appInfo.version,
    dir: './app',
    platform: 'win32',
    arch: 'x64',
    out: 'dist/',
    icon: './resources/windows/icon.ico',
    overwrite: true
  })
}

function create_installer(options) {
  return new Promise(async (resolve, reject) => {
    try {
      await installer(options);
      resolve();
    } catch (err) {
      reject(err);
    }
  });


}

;

module.exports = function () {
  console.log('Creating package...');
  return create_package().then(() => {
    console.log('Package created. Creating installer...');
    create_installer(options).then(() => {
      console.log('Installer finished');
    }).catch(err => {
      console.log('Error', err);
    });
  });
};