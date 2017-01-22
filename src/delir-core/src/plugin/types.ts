// @flow

export type PluginFeatures = 'Effect' | 'CustomLayer' | 'ExpressionExtension'

export interface PackageJSONDelirSection {
    feature: PluginFeatures
}

export interface DelirPluginPackageJson {
    name: string,
    version: string,
    author: string|Array<string>,
    main?: string,
    engines: {
        delir: string,
    },
    delir: PackageJSONDelirSection,
}
