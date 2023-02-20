var { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
var latest = require('github-latest-release');
var { compare } = require('compare-versions');

var isMac = process.platform === 'darwin'
var mainWindow, additionalWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Armygrid',
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    },
    icon: __dirname + '/assets/AG_logo.png', 
  });
  mainWindow.loadURL('https://armygrid.com');
  createMainMenu();
  fromApp();
}

function createAdditionalWindow() {
  additionalWindow = new BrowserWindow({
    title: 'Armygrid',
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true    
    },
    icon: __dirname + '/assets/AG_logo.png',
  });
  additionalWindow.loadURL('https://armygrid.com');
  createMainMenu();
  fromApp()
}

function fromApp() {
  mainWindow.webContents.executeJavaScript("localStorage.setItem('armygrid_from_app', true);", true)
}

function NotificateIfUpdate() {
  latest('mansimas', 'armygrid-app-linux', function(err, data) {
    if(err || !data.tag_name) return;
    var localVersion = require('./package.json').version;
    var newVersion = data.tag_name;
    if (compare(localVersion, newVersion, '=')) return;
    else {
      dialog.showMessageBox(
        {
          type: 'info',
          buttons:['Open Browser to download'],
          title: 'Update Available',
          message: `A new version ${newVersion} is available. \nClick to open browser and download.`,
        })
      .then(function(result) {
        if (result.response === 0) {
          shell.openExternal('https://armygrid.com/download');
        }
      });
    }
  })
}

app.whenReady().then(() => {
  createMainWindow();
  NotificateIfUpdate()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function createMainMenu() {
  var template = [
    {
      label: 'Back',
      click: () => {
        BrowserWindow.getFocusedWindow().webContents.goBack();
      }
    },
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Window',
      submenu: [
        {
          label: 'New window',
          click: () => {
            createAdditionalWindow();
          }
        },
        { role: 'close' },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [])
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
