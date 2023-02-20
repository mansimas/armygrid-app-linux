var { app, BrowserWindow, Menu, dialog, shell } = require('electron');
var latest = require('github-latest-release');
var { compare } = require('compare-versions');
// var { autoUpdater, AppUpdater } = require('electron-updater');

var isMac = process.platform === 'darwin'
var mainWindow, AdditionalWindow;

// process.env.APPIMAGE = require('path').join(__dirname, 'dist', `Armygrid-${app.getVersion()}.AppImage`)
// Object.defineProperty(app, 'isPackaged', {
//   get() {
//     return true;
//   }
// });

// autoUpdater.setFeedURL({
//   provider: "github",
//   owner: "margoch24",
//   repo: "electron-app-linux",
// });

// autoUpdater.autoDownload = false;
// autoUpdater.autoInstallOnAppQuit = true;

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
  AdditionalWindow = new BrowserWindow({
    title: 'Armygrid',
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    },
    icon: __dirname + '/assets/AG_logo.png',
  });
  AdditionalWindow.loadURL('https://armygrid.com');
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
          buttons:['Open Browser to download', 'Close'],
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

// function showMessage(message) {
//   console.log('showMessage trapped');
//   console.log(message);
//   mainWindow.webContents.executeJavaScript(`alert("${message}")`, true)
// }

app.whenReady().then(() => {
  createMainWindow();
  NotificateIfUpdate()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  })
});

// autoUpdater.on('checking-for-update', () => {
//   showMessage('Checking for update...')
// })

// autoUpdater.on("update-available", (info) => {
//   showMessage(`Update available. Current version ${app.getVersion()}`);
//   autoUpdater.downloadUpdate();
// });

// autoUpdater.on("update-not-available", (info) => {
//   showMessage(`No update available. Current version ${app.getVersion()}`);
// });

// /*Download Completion Message*/
// autoUpdater.on("update-downloaded", (info) => {
//   showMessage(`Update downloaded. Current version ${app.getVersion()}`);
// });

// autoUpdater.on("error", (info) => {
//   showMessage(info);
// });

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
