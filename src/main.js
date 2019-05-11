import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let template = [
  {
    label:'菜单',
    submenu: [{
      label: '最小化',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: '关闭',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }, {
      type: 'separator'
    }, {
      label: '重新打开窗口',
      accelerator: 'CmdOrCtrl+Shift+T',
      enabled: false,
      key: 'reopenMenuItem',
      click: function () {
        app.emit('activate')
      }
    }]
  }
]

// const isDevMode = process.execPath.match(/[\\/]electron/);
const isDevMode = false;

if (isDevMode) enableLiveReload();

const createWindow = async () => {
  // Create the browser window.
  let menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    autoHideMenuBar : true
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(VUEJS_DEVTOOLS)     
      .then((name) => console.log(`Added Extension: ${name}`))
      .catch((err) => console.log('An error occurred: ', err));

    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('open-get-invitation-dialog', function (event, user) {
  const options = {
    type: 'info',
    title: 'Invitation',
    message: "Your get an invitation from " + user,
    buttons: ['Reject', 'Accept']
  }
  dialog.showMessageBox(options, function (index) {
    event.sender.send('get-invitation-dialog-selection', index);
  })
})

ipcMain.on('open-refused-dialog', function (event) {
  const options = {
    type: 'info',
    title: 'Oh no!',
    message: "Oh no! you are refused!",
    buttons: ['Ok']
  }
  dialog.showMessageBox(options, null);
})

ipcMain.on('open-game-ready-dialog', function (event) {
  const options = {
    type: 'info',
    title: 'Game ready',
    message: "Game is ready!",
    buttons: ['Ok']
  }
  dialog.showMessageBox(options, null);
})

ipcMain.on('open-plane-error-dialog', function (event) {
  const options = {
    type: 'info',
    title: 'Error',
    message: "Your aircraft has something wrong!",
    buttons: ['Ok']
  }
  dialog.showMessageBox(options, null);
})