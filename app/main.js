'use strict';

const {connect} = require('net');
const path = require('path');
const { fork } = require('child_process');
const {app, BrowserWindow, ipcMain: ipc, Tray, Menu} = require('electron');
//const isCommandLaunched = /(electron(\.exe|\.app)?)$/.test(app.getPath('exe'));
const ApplicationMenu = require('./lib/menu');
const TrayIcon = require('./lib/trayicon');
//const AutoLauncher = require('./lib/autolaunch');
const FatalExceptionDialog = require('./lib/fatal-exception-dialog');
const {dialog} = require('electron');
const protocol = (process.env.isTestNet === 'true') ? 'testnet' : '';
/*
const autoLauncher = new AutoLauncher({
  name: app.getName(),
  path: app.getPath('exe'),
  isHidden: false
});
*/
let main;
let xCoreUI;
let tray;
let xTray;
let menu;
let userData;

const isSecondAppInstance = app.makeSingleInstance(function() {
  if (main) {
    if (main.isMinimized()) {
      main.restore();
    }
    main.show();
  }
  return true;
});

if (isSecondAppInstance) {
  app.quit();
}

if (process.platform === 'darwin') {
  app.dock.hide()
}
/**
 * Prevents application from exiting on close, instead hiding it
 */
function minimizeToSystemTray(event) {
  event.preventDefault();
  main.hide();
}

/**
 * Toggles main process options based on received updates for the
 * application settings from the renderer
 */
function updateSettings(ev, data) {
  userData = tray.userData = JSON.parse(data);
/*
  if (userData.appSettings.launchOnBoot && !isCommandLaunched) {
    autoLauncher.enable();
  } else if(!userData.appSettings.launchOnBoot && !isCommandLaunched) {
    autoLauncher.disable();
  }
*/
}

/**
 * Check if the daemon is online and starts it if not running
 */
function maybeStartDaemon(callback) {
  const sock = connect(45015);

  sock.on('connect', () => {
    sock.end();
    sock.removeAllListeners();
    callback();
  });

  sock.on('error', () => {
    sock.removeAllListeners();
    initRPCServer(callback);
  });
}

function initRPCServer(callback) {
  let RPCServer = fork(`${__dirname}/lib/rpc-server.js`, {env: {STORJ_NETWORK: protocol}});
  process.on('exit', () => {
    RPCServer.kill();
  })

  RPCServer.on('message', (msg) => {
    if(msg.state === 'init') {
      return callback();
    } else {
      RPCServer.removeAllListeners();
      let killMsg = new FatalExceptionDialog(app, main, new Error(msg.error));
      if(tray && tray.destroy) {
        tray.destroy();
      }

      killMsg.render();
    }
  });
}

function getWindowPosition() {
  let windowBounds = xCoreUI.getBounds();
  let trayBounds = xTray.getBounds();

  // Center window horizontally below the tray icon
  let x = Math.round(trayBounds.x + (trayBounds.width / 2.7) - (windowBounds.width / 2));
  // Position window 4 pixels vertically below the tray icon
  let y;
  if (process.platform === 'win32') {
    y = Math.round(trayBounds.y/2.7 + trayBounds.height);
  } else if (process.platform === 'darwin') {
    y = Math.round(trayBounds.y + trayBounds.height + 4); 
  } else {
    y = Math.round(trayBounds.y/2 + trayBounds.height); 
  }
  return {x: x, y: y};
}

/**
 * Establishes the app window, menu, tray, and other components
 * Setup IPC listeners and handlers
 */
function initRenderer() {
  menu = new ApplicationMenu();
  // main = new BrowserWindow({
  //   width: 1448,
  //   height: 600,
  //   show: false // NB: Always hidden, wait for renderer to signal show
  // });

  xCoreUI = new BrowserWindow({
    width: 460,
    height: 630,
    show: true,
    frame: false,
    skipTaskbar: true
  });

  // tray = new TrayIcon(app, main, path.join(__dirname, 'imgs'), userData);
  xTray = new Tray(path.join(__dirname, 'imgs/osx/trayHighlight@2x.png'));
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Show XCore', click: showXCore},
    {role: 'quit'}
  ])
  xTray.setToolTip('XCore')
  xTray.setContextMenu(contextMenu)
  function showXCore (item, window, event) {
    if (xCoreUI.isVisible()) {
      xCoreUI.hide();
    } else {
      let position = getWindowPosition();
      xCoreUI.setPosition(position.x, position.y);
      xCoreUI.show();
      xCoreUI.focus();
    }
  }

  // main.on('close', (e) => minimizeToSystemTray(e));
  // app.on('activate', () => xCoreUI.show());
  ipc.on('appSettingsChanged', (event, data) => updateSettings(event, data));
  // ipc.on('showApplicationWindow', () => xCoreUI.show());

  // NB: Start the daemon if not running, then render the application
  maybeStartDaemon((/* err */) => {
    menu.render();
    // main.loadURL('file://' + __dirname + '/index.html');
    xCoreUI.loadURL('file://' + __dirname + '/xIndex.html')
    xCoreUI.webContents.openDevTools();
    // tray.render();
  });
}

app.on('ready', initRenderer);
