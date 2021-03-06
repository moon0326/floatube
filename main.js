var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var Menu = electron.Menu;
var path = require('path');
var url = require('url');
var ipc = electron.ipcMain;
var settings = require('electron-settings');

require('electron-debug')({
  showDevTools: false
});

let mainWindow = [];
let mainWindowIndex = 0;
let menuInited = false;

function bindMenu() {
  var template = [
      {
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }},
            { label: "Close", accelerator: "Command+W", click: function() { BrowserWindow.getFocusedWindow().close(); }
          }
        ]
      }, 
      {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]
      }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));    
}

function createWindow (initUrl, frame) {
  var frameHeight;
  var frameWidth;
  
  if (typeof frame === 'undefined') {
    frame = true;
    frameWidth = 1024;
    frameHeight = 600;
  } else {
    frameWidth = 980;
    frameHeight = 552;
  }

  mainWindowIndex++;
  // Create the browser window.
  mainWindow[mainWindowIndex] = new BrowserWindow({
    width: frameWidth, 
    height: frameHeight,
    frame: frame,
    icon: path.join(__dirname, "icon.png")
  })
  var position = {
    x: settings.get('position.x'),
    y: settings.get('position.y')
  }
  if (position.x && position.y) {
    mainWindow[mainWindowIndex].setPosition(position.x, position.y);
  }

  if (typeof initUrl === 'undefined') {
    initUrl = url.format({
      pathname: path.join(__dirname, 'app/index.html'),
      protocol: 'file:',
      slashes: true
    })
  } else {
    mainWindow[mainWindowIndex].custom = {
      url: initUrl
    };

    initUrl = url.format({
      pathname: path.join(__dirname, 'app/youtube.html'),
      protocol: 'file:',
      slashes: true
    });
  } 

  // and load the index.html of the app.
  mainWindow[mainWindowIndex].loadURL(initUrl)
  mainWindow[mainWindowIndex].on('closed', function () {
    mainWindow[mainWindowIndex] = null
  })

  if (!menuInited) {
    // Create the Application's main menu
    bindMenu();
  }
}

ipc.on('openNewYoutube', function(event, url) {
  createWindow(url, false);
});

app.on('ready', function() {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwitein') {
    app.quit();
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
})
