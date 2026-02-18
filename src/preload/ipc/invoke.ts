// src/preload/ipc/invoke.ts
import { ipcRenderer } from "electron";

export async function invoke<Req, Res>(channel: string, req: Req): Promise<Res> {
  return (await ipcRenderer.invoke(channel, req)) as Res;
}
