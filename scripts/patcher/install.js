const {
	execSync
} = require('child_process');

const path = require('path');
const fs = require('fs');

console.log("\ninstalador deimos\n");

if (!fs.existsSync(path.join(process.cwd(), "node_modules"))) {
	console.log("você precisa instalar as dependências primeiro. rode:", "pnpm install");

	process.exit(1);
}

if (!fs.existsSync(path.join(process.cwd(), "dist", "patcher.js"))) {
	console.log("você precisa construir o projeto primeiro. rode:", "pnpm build");

	process.exit(1);
}

const {
	getMenuItem,
	getWindowsDirs,
    getDarwinDirs,
    getLinuxDirs,

    ENTRYPOINT
} = require('./common');

switch (process.platform) {
	case "win32":
		install(getWindowsDirs());

		break;

	case "darwin":
		install(getDarwinDirs());

		break;

	case "linux":
		install(getLinuxDirs());

		break;

	default:
		console.log("sistema operacional desconhecido");

		break;
}

async function install(installations) {
	const selected = await getMenuItem(installations);

	// permissões flatpak
	if (selected.isFlatpak) {
		try {
			const branch = selected.branch;
			const cwd = process.cwd();

			const globalCmd = `flatpak override ${branch} --filesystem=${cwd}`;
            const userCmd = `flatpak override --user ${branch} --filesystem=${cwd}`;

			const cmd = selected.location.startsWith("/home")
				? userCmd
				: globalCmd;

			execSync(cmd);

			console.log("permissões de escrita fornecidas com sucesso para o flatpak do discord.");
		} catch (e) {
			console.log("falha ao fornecer permissões de escrita para o flatpak do discord.");
			console.log("tente rodar esse script como administrador:", "sudo pnpm inject");

			process.exit(1);
		}
	}

	for (const version of selected.versions) {
		const dir = version.path;

		// checa se possui permissões de escrita para o diretório de instalação...
		try {
			fs.accessSync(selected.location, fs.constants.W_OK);
		} catch (e) {
			console.log("sem acesso de escrita para", selected.location);
			console.error("tente rodar esse script como administrador:", "sudo pnpm inject");

			process.exit(1);
		}

		if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
            fs.rmSync(dir, {
				recursive: true
			});
        }

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
				recursive: true
			});
        }

		fs.writeFileSync(
            path.join(dir, "index.js"),

            `require("${ENTRYPOINT}"); require("../app.asar");`
        );

        fs.writeFileSync(
            path.join(dir, "package.json"),

            JSON.stringify({
                name: "discord",

                main: "index.js"
            })
        );

        const requiredFiles = ["index.js", "package.json"];

        if (requiredFiles.every((f) => fs.existsSync(path.join(dir, f)))) {
            console.log(
                "corrigido com sucesso",

                version.name
                    ? `${selected.branch} ${version.name}`
                    : selected.branch
            );
        } else {
            console.log("falha ao corrigir", dir);

            console.log("arquivos no diretório:", fs.readdirSync(dir));
        }
	}
}