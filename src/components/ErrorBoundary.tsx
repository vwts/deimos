import {
	Margins,
    React
} from '../webpack/common';

import {
	ErrorCard
} from './ErrorCard';

import Logger from '../utils/logger';

interface Props {
    fallback?: React.ComponentType<React.PropsWithChildren<{ error: any; message: string; stack: string; }>>;
    onError?(error: Error, errorInfo: React.ErrorInfo): void;
}

const color = "#e78284";

const logger = new Logger("errorboundary do react", color);

const NO_ERROR = {};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<Props>> {
    static wrap<T = any>(Component: React.ComponentType<T>): (props: T) => React.ReactElement {
        return props => (
            <ErrorBoundary>
                <Component {...props as any} />
            </ErrorBoundary>
        );
    }

    state = {
        error: NO_ERROR as any,
		stack: "",
        message: ""
    };

    static getDerivedStateFromError(error: any) {
		let stack = error?.stack ?? "";
		let message = error?.message || String(error);

        if (error instanceof Error && stack) {
			const eolIdx = stack.indexOf("\n");

			if (eolIdx !== -1) {
				message = stack.slice(0, eolIdx);

				stack = stack.slice(eolIdx + 1).replace(/https:\/\/\S+\/assets\//g, "");
			}
		}

		return {
			error,
			stack,
			message
		};
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.props.onError?.(error, errorInfo);

        logger.error("um componente despejou um erro\n", error);
        logger.error("stack de componente", errorInfo.componentStack);
    }

    render() {
        if (this.state.error === NO_ERROR)
			return this.props.children;

        if (this.props.fallback)
            return <this.props.fallback
                children={this.props.children}
                {...this.state}
            />;

        return (
            <ErrorCard style={{
                overflow: "hidden"
            }}>
                <h1>ah não!</h1>

                <p>
                    um erro ocoreu ao renderizar esse componente. mais informações encontradas abaixo e no seu console.
                </p>

                <code>
                    {this.state.message}

					{!!this.state.stack && (
						<pre className={Margins.marginTop8}>
							{this.state.stack}
						</pre>
					)}
                </code>
            </ErrorCard>
        );
    }
}