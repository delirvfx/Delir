import PluginBase from './plugin-base'

export type PluginFeatures = 'Effect' | 'CustomLayer' | 'ExpressionExtension'

export interface PackageJSONDelirSection {
    feature: PluginFeatures,
    acceptFileTypes: string[],
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


// type of before load PluginEntry
export type PluginEntryFragment = {
    id: string,
    package: DelirPluginPackageJson,
    pluginInfo: PackageJSONDelirSection,
    packageRoot: string,
    entryPath: string,
    class?: typeof PluginBase,
    // parameters?: TypeDescriptor
}

export type PluginEntry = {
    id: string,
    package: DelirPluginPackageJson,
    pluginInfo: PackageJSONDelirSection,
    packageRoot: string,
    entryPath: string,
    class: typeof PluginBase,
    // parameters: TypeDescriptor
}

export type PluginSummary = {
    id: string,
    type: PluginFeatures,
    path: string,
    package: DelirPluginPackageJson,
}