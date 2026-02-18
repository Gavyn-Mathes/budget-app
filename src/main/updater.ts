import {
  app,
  BrowserWindow,
  Menu,
  shell,
  dialog,
  type MenuItemConstructorOptions,
  type MessageBoxOptions,
  type MessageBoxReturnValue,
} from "electron";

type WindowGetter = () => BrowserWindow | null;

type LatestReleaseResponse = {
  tag_name?: string;
  html_url?: string;
};

const FALLBACK_OWNER = "Gavyn-Mathes";
const FALLBACK_REPO = "budget-app";
const STARTUP_CHECK_DELAY_MS = 8000;
const PERIODIC_CHECK_MS = 1000 * 60 * 60 * 6;

let isChecking = false;
let lastPromptedVersion: string | null = null;

function showMessageBox(
  windowGetter: WindowGetter,
  options: MessageBoxOptions
): Promise<MessageBoxReturnValue> {
  const window = windowGetter();
  if (window) {
    return dialog.showMessageBox(window, options);
  }
  return dialog.showMessageBox(options);
}

function normalizeVersion(version: string): string {
  return version.replace(/^v/i, "").split("-")[0].split("+")[0];
}

function parseVersion(version: string): number[] {
  const parts = normalizeVersion(version)
    .split(".")
    .map((part) => Number.parseInt(part, 10));

  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function compareVersions(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  for (let i = 0; i < Math.max(va.length, vb.length); i += 1) {
    const left = va[i] ?? 0;
    const right = vb[i] ?? 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }

  return 0;
}

function releaseLinks() {
  const owner = process.env.BUDGET_UPDATER_GH_OWNER || FALLBACK_OWNER;
  const repo = process.env.BUDGET_UPDATER_GH_REPO || FALLBACK_REPO;
  return {
    apiLatest: `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
    latestReleasePage: `https://github.com/${owner}/${repo}/releases/latest`,
  };
}

async function fetchLatestRelease(): Promise<{ version: string; url: string }> {
  const { apiLatest, latestReleasePage } = releaseLinks();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(apiLatest, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": `${app.getName()}/${app.getVersion()}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const data = (await response.json()) as LatestReleaseResponse;
    if (!data.tag_name) {
      throw new Error("GitHub API response missing tag_name");
    }

    return {
      version: normalizeVersion(data.tag_name),
      url: data.html_url || latestReleasePage,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkForUpdates(windowGetter: WindowGetter, userInitiated: boolean): Promise<void> {
  if (isChecking) return;
  isChecking = true;

  try {
    const currentVersion = normalizeVersion(app.getVersion());
    const latest = await fetchLatestRelease();

    if (compareVersions(latest.version, currentVersion) > 0) {
      if (!userInitiated && latest.version === lastPromptedVersion) {
        return;
      }
      lastPromptedVersion = latest.version;

      const result = await showMessageBox(windowGetter, {
        type: "info",
        title: "Update Available",
        message: `A newer version is available (${latest.version}).`,
        detail: `You are on version ${currentVersion}. Open the release page to download the update?`,
        buttons: ["Open Release Page", "Later"],
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      });

      if (result.response === 0) {
        await shell.openExternal(latest.url);
      }
      return;
    }

    if (userInitiated) {
      await showMessageBox(windowGetter, {
        type: "info",
        title: "No Updates",
        message: "You're up to date.",
        detail: `Current version: ${currentVersion}`,
        buttons: ["OK"],
        defaultId: 0,
        noLink: true,
      });
    }
  } catch (error) {
    console.error("[updater] checkForUpdates failed:", error);

    if (userInitiated) {
      const { latestReleasePage } = releaseLinks();
      const result = await showMessageBox(windowGetter, {
        type: "error",
        title: "Update Check Failed",
        message: "Could not check for updates right now.",
        detail: "You can open the release page and check manually.",
        buttons: ["Open Release Page", "Close"],
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      });

      if (result.response === 0) {
        await shell.openExternal(latestReleasePage);
      }
    }
  } finally {
    isChecking = false;
  }
}

export function initUpdateChecker(windowGetter: WindowGetter): void {
  if (!app.isPackaged) {
    console.log("[updater] Running in development; manual update checker is available from menu.");
  }

  const template: MenuItemConstructorOptions[] = [
    ...(process.platform === "darwin" ? [{ role: "appMenu" as const }] : []),
    { role: "fileMenu" as const },
    { role: "editMenu" as const },
    { role: "viewMenu" as const },
    { role: "windowMenu" as const },
    {
      label: "Help",
      submenu: [
        {
          label: "Check for Updates...",
          click: () => {
            void checkForUpdates(windowGetter, true);
          },
        },
        {
          label: "View Latest Release",
          click: () => {
            const { latestReleasePage } = releaseLinks();
            void shell.openExternal(latestReleasePage);
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  if (!app.isPackaged) {
    return;
  }

  const startupTimer = setTimeout(() => {
    void checkForUpdates(windowGetter, false);
  }, STARTUP_CHECK_DELAY_MS);
  startupTimer.unref();

  const periodicTimer = setInterval(() => {
    void checkForUpdates(windowGetter, false);
  }, PERIODIC_CHECK_MS);
  periodicTimer.unref();
}
