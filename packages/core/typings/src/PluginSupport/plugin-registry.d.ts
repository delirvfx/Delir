import EffectPluginBase from './PostEffectBase'
import { AnyParameterTypeDescriptor } from './type-descriptor'
import { DelirPluginPackageJson, PluginEntry, PluginSummary } from './types'
export default class PluginRegistry {
    public static validateEffectPluginPackageJSON(packageJSON: any): packageJSON is DelirPluginPackageJson
    private _plugins
    public registerPlugin(entries: PluginEntry[]): void
    /**
     * get plugin constructor class
     * @param   {string}    target plugin ID
     * @throws UnknownPluginReferenceException
     */
    public requirePostEffectPluginById(id: string): typeof EffectPluginBase
    /**
     * get specified plugin's provided parameter list
     * @param   {string}    target plugin ID
     * @throws UnknownPluginReferenceException
     * @throws PluginAssertionFailedException
     */
    public getPostEffectParametersById(id: string): AnyParameterTypeDescriptor[] | null
    /**
     * get plugin entry
     * @param   {string}    id      target plugin ID
     * @throws UnknownPluginReferenceException
     */
    public getPlugin(id: string): Readonly<PluginEntry>
    /**
     * get registered plugins as array
     */
    public getPostEffectPlugins(): PluginSummary[]
}
