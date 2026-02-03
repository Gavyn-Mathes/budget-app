// src/preload/ipc/invoke.ts
import { ipcRenderer } from "electron";
import type { ZodTypeAny } from "zod";

export async function invokeZod<Req, Res>(opts: {
  channel: string;
  reqSchema: ZodTypeAny;
  resSchema: ZodTypeAny;
  req: Req;
}): Promise<Res> {
  const parsedReq = opts.reqSchema.parse(opts.req);
  const raw = await ipcRenderer.invoke(opts.channel, parsedReq);
  return opts.resSchema.parse(raw) as Res;
}
