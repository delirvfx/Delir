// @flow

export type PluginFeatures = 'Effect' | 'CustomLayer' | 'ExpressionExtension'

export type DelirPluginPackageJson = {
    name: string,
    version: string,
    author: string|Array<string>,
    main?: string,
    engines: {
        delir: string,
    },
    delir: {
        feature: Array<PluginFeatures>,
    },
}
