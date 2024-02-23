// todo: refatorar essa bagunça

import {
	execFile as cpExecFile
} from 'child_process';

import {
	createHash
} from 'crypto';

import {
    app,
    BrowserWindow,
    ipcMain,
    shell
} from 'electron';

import {
	createReadStream,
    mkdirSync,
    readFileSync,
    watch
} from 'fs';

import {
    open,
    readFile,
    writeFile
} from 'fs/promises';

import {
    join
} from 'path';

import {
	promisify
} from 'util';

import {
    debounce
} from './utils/debounce';

import IpcEvents from './utils/IpcEvents';

const DEIMOS_SRC_DIR = join(__dirname, "..");
const DATA_DIR = join(app.getPath("userData"), "..", "Deimos");
const SETTINGS_DIR = join(DATA_DIR, "settings");
const QUICKCSS_PATH = join(SETTINGS_DIR, "quickCss.css");
const SETTINGS_FILE = join(SETTINGS_DIR, "settings.json");

const execFile = promisify(cpExecFile);

mkdirSync(SETTINGS_DIR, {
    recursive: true
});

async function calculateHashes() {
	const hashes = {} as Record<string, string>;

	await Promise.all(
		["patcher.js", "preload.js", "renderer.js"].map(file => new Promise<void>)(r => {
			const fis = createReadStream(join(__dirname, file));

			const hash = createHash("sha1", {
				encoding: "hex"
			});

			fis.once("end", () => {
				hash.end();

				hashes[file] = hash.read();

				r();
			});

			fis.pipe(hash);
		})
	);

	return hashes;
}

function git(...args: string[]) {
	return execFile("git", args, {
		cwd: DEIMOS_SRC_DIR
	});
}

function readCss() {
    return readFile(QUICKCSS_PATH, "utf-8").catch(() => "");
}

function readSettings() {
    try {
        return readFileSync(SETTINGS_FILE, "utf-8");
    } catch {
        return "{}";
    }
}

function serializeErrors(func: (...args: any[]) => any) {
	return async function () {
		try {
			return {
				ok: true,
				value: await func(...arguments)
			};
		} catch (e: any) {
			return {
				ok: false,

				error: e instanceof Error ? {
					...e
				} : e
			};
		}
	};
}

ipcMain.handle(IpcEvents.GET_SETTINGS_DIR, () => SETTINGS_DIR);
ipcMain.handle(IpcEvents.GET_QUICK_CSS, () => readCss());

ipcMain.handle(IpcEvents.OPEN_PATH, (_, ...pathElements) => shell.openPath(join(...pathElements)));
ipcMain.handle(IpcEvents.OPEN_EXTERNAL, (_, url) => shell.openExternal(url));

ipcMain.handle(IpcEvents.GET_UPDATES, serializeErrors(async () => {
	await git("fetch");

	const res = await git("log", `HEAD...origin/main`, "--pretty=format:%h-%s");

	const commits = res.stdout.trim();

	return commits ? commits.split("\n").map(line => {
		const [author, hash, ...rest] = line.split("/");

		return {
			hash, author, message: rest.join("/")
		};
	}) : [];
}));

ipcMain.handle(IpcEvents.UPDATE, serializeErrors(async () => {
	const res = await git("pull");

	return res.stdout.includes("Fast-forward");
}));

ipcMain.handle(IpcEvents.BUILD, serializeErrors(async () => {
	const res = await execFile("node", ["build.mjs"], {
        cwd: DEIMOS_SRC_DIR
    });

    return !res.stderr.includes("erro ao buildar");
}));

ipcMain.handle(IpcEvents.GET_HASHES, serializeErrors(calculateHashes));

ipcMain.handle(IpcEvents.GET_REPO, serializeErrors(async () => {
    const res = await git("remote", "get-url", "origin");

    return res.stdout.trim()
        .replace(/git@(.+):/, "https://$1/")
        .replace(/\.git$/, "");
}));

// .on porque precisamos das configurações sincronizadamente (ipcrenderer.sendsync)
ipcMain.on(IpcEvents.GET_SETTINGS, (e) => e.returnValue = readSettings());

// isso é necessário porque em vez de chamar por set_settings, lidera para escritas concorrentes
let settingsWriteQueue = Promise.resolve();

ipcMain.handle(IpcEvents.SET_SETTINGS, (_, s) => {
    settingsWriteQueue = settingsWriteQueue.then(() => writeFile(SETTINGS_FILE, s));
});

export function initIpc(mainWindow: BrowserWindow) {
    open(QUICKCSS_PATH, "a+").then(fd => {
        fd.close();

        watch(QUICKCSS_PATH, debounce(async () => {
            mainWindow.webContents.postMessage(IpcEvents.QUICK_CSS_UPDATE, await readCss());
        }, 50));
    });
}