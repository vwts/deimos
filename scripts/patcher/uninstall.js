const path = require('path');
const fs = require('fs');

console.log("\ndesinstalador deimos\n");

if (!fs.existsSync(path.join(process.cwd(), "node_modules"))) {
	console.log("você precisa instalar dependências primeiro. rode:", "pnpm install");

	process.exit(1);
}

const {
    getMenuItem,
    getWindowsDirs,
    getDarwinDirs,
    getLinuxDirs
} = require('./common');

switch (process.platform) {
    case "win32":
        uninstall(getWindowsDirs());

        break;

    case "darwin":
        uninstall(getDarwinDirs());

        break;

    case "linux":
        uninstall(getLinuxDirs());

        break;

    default:
        console.log("sistema operacional desconhecido");

        break;
}

async function uninstall(installations) {
    const selected = await getMenuItem(installations);

    for (const version of selected.versions) {
        const dir = version.path;

        // checa se possui permissões de escrita para o diretório de instalação...
        try {
            fs.accessSync(selected.location, fs.constants.W_OK);
        } catch (e) {
            console.error("sem acesso de escrita em", selected.location);
            console.error("tente rodar esse script como administrador:", "sudo pnpm uninject");

            process.exit(1);
        }

        if (fs.existsSync(dir)) {
            fs.rmSync(dir, {
				recursive: true
			});
        }

        console.log(
            "descompactado com sucesso",

            version.name
                ? `${selected.branch} ${version.name}`
                : selected.branch
        );
    }
}