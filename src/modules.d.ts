// eslint-disable-next-line spaced-comment
/// <reference types="standalone-electron-types"/>

declare module "plugins" {
    const plugins: Record<string, import('./utils/types').Plugin>;

    export default plugins;
}

declare module "git-hash" {
    const hash: string;

    export default hash;
}