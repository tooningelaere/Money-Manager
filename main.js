const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow } = electron;

let win;

// open app on master screen
app.on("ready", function () {
  // create new window
  win = new BrowserWindow({
    icon: `./assets/images/master-page/icon.png`,
    show: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
    },
  });
  // load html into window
  win.loadURL(`file://${__dirname}/masterWindow.html`);
  win.setMenuBarVisibility(false);
  win.maximize();

  win.once("ready-to-show", () => {
    win.show();
  });
});

app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});
