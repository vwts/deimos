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
	Parser,
	Toasts
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
import ErrorBoundary from './ErrorBoundary';

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

export default ErrorBoundary.wrap(function Updater() {
	const [repo, err, repoPending] = useAwaiter(getRepo, "carregando...");

    const [isChecking, setIsChecking] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);

    const [updates, setUpdates] = React.useState(changes);

	React.useEffect(() => {
		if (err)
			UpdateLogger.error("falha ao recuperar repositório", err);
	}, [err]);

	const isOutdated = updates.length > 0;

	return (
		<Forms.FormSection tag="h1" title="updater do deimos">
			<Forms.FormTitle tag="h5">repo</Forms.FormTitle>

			<Forms.FormText>{repoPending ? repo : err ? "falha ao recuperar - veja o console" : (
				<Link href={repo}>
					{repo.split("/").slice(-2).join("/")}
				</Link>
			)} ({gitHash})</Forms.FormText>

			<Forms.FormDivider />

			<Forms.FormTitle tag="h5">atualizações</Forms.FormTitle>

			<Forms.FormText className={Margins.marginBottom8}>
				{updates.length ? `aqui estão ${updates.length} atualizações` : "atualizado!"}
			</Forms.FormText>

			{updates.length > 0 && (
				<Card style={{ pending: ".5em" }}>
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
			)}

			<Flex className={`${Margins.marginBottom8} ${Margins.marginTop8}`}>
				{isOutdated && <Button
					size={Button.Sizes.SMALL}
					disabled={isUpdating || isChecking}

					onClick={withDispatcher(setIsUpdating, async () => {
						if (await update()) {
							setUpdates([]);

							const needFullRestart = await rebuild();

							await new Promise<void>(r => {
								Alerts.show({
									title: "sucesso com atualização!",
									body: "atualizado com sucesso. reiniciar agora para aplicar as mudanças?",

									confirmText: "reiniciar",
									cancelText: "não agora!",

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
					atualizar agora
				</Button>}

				<Button
					size={Button.Sizes.SMALL}
					disabled={isUpdating || isChecking}

					onClick={withDispatcher(setIsChecking, async () => {
						const outdated = await checkForUpdates();

						if (outdated) {
							setUpdates(changes);
						} else {
							setUpdates([]);
							
							Toasts.show({
								message: "nenhuma atualização encontrada!",

								id: Toasts.genId(),
								type: Toasts.Type.MESSAGE,

								options: {
									position: Toasts.Position.BOTTOM
								}
							});
						}
					})}
				>
					verificar atualizações
				</Button>
			</Flex>
		</Forms.FormSection>
	);
});