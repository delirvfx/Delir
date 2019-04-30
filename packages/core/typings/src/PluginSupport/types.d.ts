import PluginBase from './plugin-base'
export declare type PluginTypes = 'post-effect'
export interface PackageJSONDelirSection {
    name: string
    type: PluginTypes
}
export interface DelirPluginPackageJson {
    name: string
    version: string
    author: string | string[]
    main?: string
    engines: {
        'delir-core': string
    }
    delir: PackageJSONDelirSection
}
export interface PluginEntry {
    id: string
    type: PluginTypes
    packageJson: DelirPluginPackageJson
    class: typeof PluginBase
}
export interface PluginSummary {
    id: string
    name: string
    type: PluginTypes
    package: DelirPluginPackageJson
}
