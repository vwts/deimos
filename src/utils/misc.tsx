import {
    React
} from '../webpack';

/**
 * função lazy. na primeira chamada, o valor é computado.
 * em chamadas sub-sequentes, o mesmo valor computado retornará
 * 
 * @param factory função factory
 */
export function lazy<T>(factory: () => T): () => T {
    let cache: T;

    return () => {
        return cache ?? (cache = factory());
    };
}

/**
 * aguarda pela promise
 * 
 * @param factory factory
 * @param fallbackValue o valor fallback que será utilizado a não ser que a promise seja resolvida
 * 
 * @returns um estado que será vazio
 */
export function useAwaiter<T>(factory: () => Promise<T>, fallbackValue: T | null = null): T | null {
    const [res, setRes] = React.useState<T | null>(fallbackValue);

    React.useEffect(() => {
        factory().then(setRes);
    }, []);
    
    return res;
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

        return <Component {...props} />;
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