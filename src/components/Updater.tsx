import {
	changes,
	checkForUpdates,
	getRepo,
	rebuild,
	update,
	UpdateLogger
} from '../utils/updater';

import {
	React,
	Forms,
	Button,
	Margins,
	Alerts,
	Card,
	Parser
} from '../webpack/common';

import {
	Flex
} from './Flex';

import {
	useAwaiter
} from '../utils/misc';

import {
	Link
} from './Link';

import gitHash from 'git-hash';

interface Props {
	setIsOutdated(b: boolean): void;
}

function withDispatcher(dispatcher: React.Dispatch<React.SetStateAction<boolean>>, action: () => any) {
	return async () => {
		dispatcher(true);

		try {
			await action();
		} catch (e: any) {
			UpdateLogger.error("falha ao atualizar", e);

			if (!e) {
				var err = "ocorreu um erro desconhecido (erro indefinido).\npor favor tente novamente.";
			} else if (e.code && e.cmd) {
				const { code, path, cmd, stderr } = e;

				if (code === "ENOENT")
					var err = `comando \`${path}\` não encontrado.\npor favor instale-o e tente novamente`;

				else {
					var err = `ocorreu um erro ao executar \`${cmd}\`:\n`;

					err += stderr || `código \`${code}\`. veja o console para mais informações`;
				}
			} else {
				var err = "ocorreu um erro desconhecido. veja o console para mais informações.";
			}

			Alerts.show({
				title: "oops!",

				body: err.split("\n").map(line => <div>{Parser.parse(line)}</div>)
			});
		}

		finally {
			dispatcher(false);
		}
	};
};

export function Updater(p: Props) {
	const [repo, err, repoPending] = useAwaiter(getRepo, "carregando...");

    const [isChecking, setIsChecking] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);

    const [updates, setUpdates] = React.useState(changes);

	React.useEffect(() => {
		if (err)
			UpdateLogger.error("falha ao recuperar repositório", err);
	}, [err]);

	return (
		<>
			<Forms.FormText>repo: {repoPending ? repo : err ? "falha ao recuperar - veja o console" : (
				<Link href={repo}>
					{repo.split("/").slice(-2).join("/")}
				</Link>
			)} ({gitHash})</Forms.FormText>

			<Forms.FormText className={Margins.marginBottom8}>
				há {updates.length} atualizações disponíveis
			</Forms.FormText>

			<Card style={{ padding: ".5em" }}>
				{updates.map(({ hash, author, message }) => (
					<div>
						<Link href={`${repo}/commit/${hash}`} disabled={repoPending}>
							<code>{hash}</code>
						</Link>

						<span style={{
							marginLeft: "0.5em",
							color: "var(--text-normal)"
						}}>{message} - {author}</span>
					</div>
				))}
			</Card>

			<Flex className={`${Margins.marginBottom8} ${Margins.marginTop8}`}>
				<Button
					size={Button.Sizes.SMALL}
					disabled={isUpdating || isChecking}

					onClick={withDispatcher(setIsUpdating, async () => {
						if (await update()) {
							p.setIsOutdated(false);

							const needFullRestart = await rebuild();

							await new Promise<void>(r => {
								Alerts.show({
									title: "atualizado com sucesso!",

									body: "atualizado com sucesso. reiniciar agora para aplicar as mudanças?",

									confirmText: "reiniciar",
									cancelText: "agora não",

									onConfirm() {
										if (needFullRestart)
											window.DiscordNative.app.relaunch();

										else
											location.reload();

										r();
									},

									onCancel: r
								});
							});
						}
					})}
				>
					atualizar
				</Button>

				<Button
					size={Button.Sizes.SMALL}
					disabled={isUpdating || isChecking}

					onClick={withDispatcher(setIsChecking, async () => {
						const res = await checkForUpdates();

						if (res) {
							setUpdates(changes);
						} else {
							p.setIsOutdated(false);
						}
					})}
				>
					refresh
				</Button>
			</Flex>
		</>
	);
}