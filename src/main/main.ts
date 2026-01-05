// main/main.ts
import { app, BrowserWindow } from "electron"
import path from "path"
import { initDb } from "./db"
import { registerIpcHandlers } from "./ipc/register"


// MUST be before app.whenReady()
app.commandLine.appendSwitch("no-sandbox")
app.commandLine.appendSwitch("disable-gpu-sandbox")

// Force native Wayland (avoid X11/DRI3 path)
app.commandLine.appendSwitch("enable-features", "UseOzonePlatform")
app.commandLine.appendSwitch("ozone-platform", "wayland")

// Force software GL (very stable on WSLg)
app.commandLine.appendSwitch("use-gl", "angle")
app.commandLine.appendSwitch("use-angle", "swiftshader")

// If you're using Vite, you typically have a dev server URL.
// Many templates set this in env. We'll fall back to localhost.
const DEV_SERVER_URL =
  process.env.VITE_DEV_SERVER_URL ||
  process.env.ELECTRON_RENDERER_URL ||
  "http://localhost:5173"

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "../preload/index.js"), // adjust if your build outputs differ
    },
  })

  if (app.isPackaged) {
    // packaged build: load built index.html
    win.loadFile(path.join(__dirname, "../renderer/index.html"))
  } else {
    // dev: load Vite dev server
    win.loadURL(DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: "detach" })
  }
}

app.whenReady().then(() => {
  initDb()
  registerIpcHandlers()
  createWindow()
})

// Standard mac behavior
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
