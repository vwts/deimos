import {
	FilterFn,
	find
} from '../webpack';

import {
    React
} from '../webpack/common';

/**
 * função lazy. na primeira chamada, o valor é computado.
 * em chamadas sub-sequentes, o mesmo valor computado retornará
 *
 * @param factory função factory
 */
export function lazy<T>(factory: () => T): () => T {
    let cache: T;

    return () => cache ?? (cache = factory());
}

/**
 * faz uma pesquisa pelo webpack
 * pesquisa o módulo no acesso da primeira propriedade
 *
 * @param filter função filter
 *
 * @returns uma proxy para o módulo webpack
 */
export function lazyWebpack<T = any>(filter: FilterFn): T {
	const getMod = lazy(() => find(filter));

	return new Proxy(() => null, {
		get: (_, prop) => getMod()[prop],
		set: (_, prop, value) => getMod()[prop] = value,
		has: (_, prop) => prop in getMod(),
        apply: (_, $this, args) => (getMod() as Function).apply($this, args),
        ownKeys: () => Reflect.ownKeys(getMod()),
        construct: (_, args, newTarget) => new newTarget(...args),
        deleteProperty: (_, prop) => delete getMod()[prop],
        defineProperty: (_, property, attributes) => !!Object.defineProperty(getMod(), property, attributes)
	}) as T;
}

/**
 * aguarda pela promise
 *
 * @param factory factory
 * @param fallbackValue o valor fallback que será utilizado a não ser que a promise seja resolvida
 *
 * @returns [value, error, isPending]
 */
export function useAwaiter<T>(factory: () => Promise<T>): [T | null, any, boolean];
export function useAwaiter<T>(factory: () => Promise<T>, fallbackValue: T): [T, any, boolean];

export function useAwaiter<T>(factory: () => Promise<T>, fallbackValue: T | null = null): [T | null, any, boolean] {
    const [state, setState] = React.useState({
        value: fallbackValue,
        error: null as any,
        pending: true
    });

    React.useEffect(() => {
        let isAlive = true;

        factory()
            .then(value => isAlive && setState({
                value,
                error: null,
                pending: false
            }))

            .catch(error => isAlive && setState({
                value: null,
                error,
                pending: false
            }));
    }, []);

    return [state.value, state.error, state.pending];
}

/**
 * um componente lazy. o método factory é chamado no primeiro render.
 * útil para const component = lazycomponent(() => findbydisplayname("...").default)
 *
 * @param factory função retornando um componente
 *
 * @returns resultado ou função factory
 */
export function LazyComponent<T = any>(factory: () => React.ComponentType<T>) {
    return (props: T) => {
        const Component = React.useMemo(factory, []);

        return <Component {...props as any} />;
    };
}

/**
 * recursivamente default em um objeto e retorna o mesmo objeto
 *
 * @param obj objeto
 * @param defaults padrões
 *
 * @returns
 */
export function mergeDefaults<T>(obj: T, defaults: T): T {
    for (const key in defaults) {
        const v = defaults[key];

        if (typeof v === 'object' && !Array.isArray(v)) {
            obj[key] ??= {} as any;

            mergeDefaults(obj[key], v);
        } else {
            obj[key] ??= v;
        }
    }

    return obj;
}

/**
 * aloca um array de strings em um jeito legível para humanos (1, 2 e 3)
 *
 * @param elements elementos
 */
export function humanFriendlyJoin(elements: string[]): string;

/**
 * aloca um array de strings em um jeito legível para humanos (1, 2 e 3)
 *
 * @param elements elementos
 * @param mapper função que converte elementos em uma string
 */
export function humanFriendlyJoin<T>(elements: T[], mapper: (e: T) => string): string;

export function humanFriendlyJoin(elements: any[], mapper: (e: any) => string = s => s): string {
    const { length } = elements;

    if (length === 0) return "";
    if (length === 1) return mapper(elements[0]);

    let s = "";

    for (let i = 0; i < length; i++) {
        s += mapper(elements[i]);

        if (length - i > 2)
            s += ", ";

        else if (length - i > 1)
            s += " e ";
    }

    return s;
}

/**
 * chama .join(" ") nos argumentos
 *
 * classes("um", "dois") => "um dois"
 */
export function classes(...classes: string[]) {
	return classes.join(" ");
}