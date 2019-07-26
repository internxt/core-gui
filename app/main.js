'use strict';

const { connect } = require('net');
const path = require('path');
const { fork } = require('child_process');
const { app, BrowserWindow, ipcMain: ipc, Tray, Menu, shell } = require('electron');
const ApplicationMenu = require('./lib/menu');
const TrayIcon = require('./lib/trayicon');
const FatalExceptionDialog = require('./lib/fatal-exception-dialog');
const protocol = process.env.isTestNet === 'true' ? 'testnet' : '';
const os = require('os');

let main;
let xCoreUI;
let tray;
let xTray;
let menu;
let userData;

if (app.requestSingleInstanceLock()) {
  if (main) {
    if (main.isMinimized()) {
      main.restore();
    }
    main.show();
  }
}

app.on('second-instance', (event, argv, cwd) => {
  console.log('Second instance');
  app.quit();
});

if (process.platform === 'darwin') {
  app.dock.hide();
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
  let RPCServer = fork(`${__dirname}/lib/rpc-server.js`, {
    env: { STORJ_NETWORK: 'INXT' }
  });

  process.on('exit', () => {
    RPCServer.kill();
  });

  RPCServer.on('message', msg => {
    if (msg.state === 'init') {
      return callback();
    } else {
      RPCServer.removeAllListeners();
      let killMsg = new FatalExceptionDialog(app, main, new Error(msg.error));
      if (tray && tray.destroy) {
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
  let x = Math.round(
    trayBounds.x + trayBounds.width / 2.7 - windowBounds.width / 2
  );

  // Position window 4 pixels vertically below the tray icon
  let y;
  if (process.platform === "win32") {
    y = trayBounds.y - windowBounds.height;
  } else if (process.platform === "darwin") {
    y = Math.round(trayBounds.y + trayBounds.height + 4);
  } else {
    y = Math.round(trayBounds.y / 2 + trayBounds.height);
  }
  return { x: x, y: y };
}

/**
 * Establishes the app window, menu, tray, and other components
 * Setup IPC listeners and handlers
 */
function initRenderer() {
  menu = new ApplicationMenu();

  xCoreUI = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 389,
    height: 660,
    show: true,
    frame: false,
    skipTaskbar: true,
    alwaysOnTop: false
  });

  // tray = new TrayIcon(app, main, path.join(__dirname, 'imgs'), userData);
  xTray = new Tray(path.join(__dirname, 'imgs/osx/trayHighlight@2x.png'));
  const contextMenu = () => Menu.buildFromTemplate([
    { label: (xCoreUI.isVisible() ? 'Hide' : 'Show') + ' X Core', click: showXCore },
    {
      label: 'View logs',
      click: () => {
        var logPath = path.join(os.homedir(), '.xcore/logs');
        shell.openItem(logPath);
      }
    },
    { role: 'quit' }
  ]);

  xTray.setToolTip('XCore');

  xTray.setContextMenu(contextMenu());

  xTray.on('double-click', () => {
    showXCore();
  });

  xTray.on('click', () => {
    if (xCoreUI.isVisible() && !xCoreUI.isFocused()) {
      xCoreUI.focus();
    } else {
      showXCore();
    }
  });

  function showXCore(item, window, event) {
    if (xCoreUI.isVisible()) {
      xCoreUI.hide();
    } else {
      let position = getWindowPosition();
      xCoreUI.setPosition(position.x, position.y);
      xCoreUI.show();
      xCoreUI.focus();
    }
    xTray.setContextMenu(contextMenu());
  }

  // main.on('close', (e) => minimizeToSystemTray(e));
  // app.on('activate', () => xCoreUI.show());
  ipc.on("appSettingsChanged", (event, data) => updateSettings(event, data));
  // ipc.on('showApplicationWindow', () => xCoreUI.show());

  // NB: Start the daemon if not running, then render the application
  maybeStartDaemon((/* err */) => {
    menu.render();
    xCoreUI.loadURL("file://" + __dirname + "/xIndex.html");
    //xCoreUI.webContents.openDevTools();
    // tray.render();
  });
}

app.on('ready', () => {
  initRenderer();
  let { x, y } = getWindowPosition();
  xCoreUI.setPosition(x, y);
});
