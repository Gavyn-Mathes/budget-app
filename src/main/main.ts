// src/main/main.ts
import { app, BrowserWindow } from "electron"
import path from "path"
import { initDb } from "./db"
import { registerIpcHandlers } from "./ipc/register"

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.openDevTools({ mode: "detach" })

  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    console.error("did-fail-load:", { code, desc, url })
  })

  win.webContents.on("did-finish-load", () => {
    console.log("did-finish-load:", win?.webContents.getURL())
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL
  console.log("VITE_DEV_SERVER_URL =", devUrl)

  if (devUrl) {
    win.loadURL(devUrl)
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"))
  }
}

app.whenReady().then(() => {
  initDb()
  registerIpcHandlers()
  createWindow()
})
