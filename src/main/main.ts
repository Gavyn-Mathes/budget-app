import { app, BrowserWindow } from "electron";
import path from "path";
import { initDb } from "./db";
import { registerIpcHandlers } from "./ipc/register"; // or "./ipc" depending on your file

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  win.on("closed", () => {
    win = null;
  });

  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    console.error("did-fail-load:", { code, desc, url });
  });

  win.webContents.on("did-finish-load", () => {
    console.log("did-finish-load:", win?.webContents.getURL());
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  console.log("VITE_DEV_SERVER_URL =", devUrl);

  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  initDb();
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  // On macOS, apps commonly stay open until user quits explicitly
  if (process.platform !== "darwin") app.quit();
});
