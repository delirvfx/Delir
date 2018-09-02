import PluginBase from './plugin-base'

export type PluginTypes = 'post-effect'

export interface PackageJSONDelirSection {
    type: PluginTypes
    // acceptFileTypes?: {[extension: string]: string}
}

export interface DelirPluginPackageJson {
    name: string
    version: string
    author: string | string[]
    main?: string
    engines: {
        'delir-core': string
    },
    delir: PackageJSONDelirSection
}

export interface PluginEntry {
    id: string
    type: PluginTypes
    packageJson: DelirPluginPackageJson
    class: typeof PluginBase
    // parameters: TypeDescriptor
}

export interface PluginSummary {
    id: string
    type: PluginTypes
    package: DelirPluginPackageJson
}
