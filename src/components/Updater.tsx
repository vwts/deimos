import {
	changes,
	checkForUpdates,
	getRepo,
	rebuild,
	update,
	UpdateLogger,
	updateError,
	isOutdated,
	isNewer
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
	classes,
	useAwaiter
} from '../utils/misc';

import {
	Link
} from './Link';

import {
	ErrorCard
} from './ErrorCard';

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

				body: (
					<ErrorCard>
						{err.split("\n").map(line => <div>{Parser.parse(line)}</div>)}
					</ErrorCard>
				)
			});
		}

		finally {
			dispatcher(false);
		}
	};
};

interface CommonProps {
	repo: string;
	repoPending: boolean;
}

function Changes({ updates, repo, repoPending }: CommonProps & { updates: typeof changes; }) {
	return (
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
	);
}

function Updatable(props: CommonProps) {
	const [updates, setUpdates] = React.useState(changes);

    const [isChecking, setIsChecking] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);

	const isOutdated = updates.length > 0;

	return (
		<>
			{!updates && updateError ? (
				<>
					<Forms.FormText>falha ao checar por atualizações. veja o console para mais informações</Forms.FormText>

					<ErrorCard style={{ padding: "1em" }}>
						<p>{updateError.stderr || updateError.stdout || "ocorreu um erro desconhecido"}</p>
					</ErrorCard>
				</>
			) : (
				<Forms.FormText className={Margins.marginBottom8}>
					{isOutdated ? `${updates.length} novas atualizações disponíveis` : "atualizado!"}
				</Forms.FormText>
			)}

			{isOutdated && <Changes updates={updates} {...props} />}

			<Flex className={classes(Margins.marginBottom8, Margins.marginTop8)}>
				{isOutdated && <Button
					size={Button.Sizes.SMALL}
					disabled={isUpdating || isChecking}

					onClick={withDispatcher(setIsUpdating, async () => {
						if (await update()) {
							setUpdates([]);

							const needFullRestart = await rebuild();

							await new Promise<void>(r => {
								Alerts.show({
									title: "atualizado com sucesso!",
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
					verificar por atualizações
				</Button>
			</Flex>
		</>
	);
}

function Newer(props: CommonProps) {
	return (
		<>
			<Forms.FormText className={Margins.marginBottom8}>
				sua cópia local possui commits mais recentes. por favor, esconda-as ou reinicie-as.
            </Forms.FormText>

            <Changes {...props} updates={changes} />
		</>
	);
}

export default ErrorBoundary.wrap(function Updater() {
    const [repo, err, repoPending] = useAwaiter(getRepo, "carregando...");

    React.useEffect(() => {
        if (err)
            UpdateLogger.error("falha ao recuperar repositório", err);
    }, [err]);

    const commonProps: CommonProps = {
        repo,
        repoPending
    };

    return (
        <Forms.FormSection tag="h1" title="Vencord Updater">
            <Forms.FormTitle tag="h5">
				repositório
			</Forms.FormTitle>

            <Forms.FormText>{repoPending ? repo : err ? "falha ao recuperar - veja o console" : (
                <Link href={repo}>
                    {repo.split("/").slice(-2).join("/")}
                </Link>
            )} ({gitHash})</Forms.FormText>

            <Forms.FormDivider />

            <Forms.FormTitle tag="h5">
				atualizações
			</Forms.FormTitle>

            {isNewer ? <Newer {...commonProps} /> : <Updatable {...commonProps} />}
        </Forms.FormSection >
    );
});