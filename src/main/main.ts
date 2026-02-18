// src/main/main.ts
import { app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { initDb } from "./db";
import { registerIpcHandlers } from "./ipc/register";
import { initUpdateChecker } from "./updater";

app.disableHardwareAcceleration();

let win: BrowserWindow | null = null;

function createWindow() {
  const preloadPath = path.join(__dirname, "../preload/index.js");
  console.log("[main] __dirname =", __dirname);
  console.log("[main] preloadPath =", preloadPath, "exists?", fs.existsSync(preloadPath));

  win = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Pipe renderer/preload console into terminal
  win.webContents.on("console-message", (_event: any) => {
    const { level, message, lineNumber, sourceId } = _event;
    console.log(`[renderer console L${level}] ${message} (${sourceId}:${lineNumber})`);
  });

  win.on("closed", () => {
    win = null;
  });

  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    console.error("[main] did-fail-load:", { code, desc, url });
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  console.log("[main] VITE_DEV_SERVER_URL =", devUrl);

  if (!devUrl && !app.isPackaged) {
    console.warn(
      "[main][dev] VITE_DEV_SERVER_URL is missing. If your renderer isn't loading, you may not be running via `electron-vite dev`."
    );
  }

  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    const indexHtml = path.join(__dirname, "../renderer/index.html");
    console.log("[main] loading file =", indexHtml, "exists?", fs.existsSync(indexHtml));
    win.loadFile(indexHtml);
  }

  win.webContents.on("did-finish-load", async () => {
    const url = win?.webContents.getURL();
    console.log("[main] did-finish-load:", url);

    try {
      const info = await win!.webContents.executeJavaScript(
        "({ href: location.href, hasApi: !!window.api, keys: window.api ? Object.keys(window.api) : [] })"
      );
      console.log("[main] renderer api check:", info);
    } catch (err) {
      console.error("[main] renderer api check failed:", err);
    }
  });

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  initDb();
  registerIpcHandlers();
  createWindow();
  initUpdateChecker(() => win);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
