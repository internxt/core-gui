'use strict';

require('dotenv').config();

const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {

    console.log('Notarizing...');
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.xcore.farmer',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  });
};
