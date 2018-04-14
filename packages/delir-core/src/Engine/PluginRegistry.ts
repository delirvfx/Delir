export enum PluginTypes {
    postEffect = 'PostEffect'
}

export interface PluginEntry {
    type: PluginTypes
    version: string
    author: string | string[]
    factory: any
}

/**
 * Store and searching plugins.
 *
 * This class provides "Store", "Search" function.
 * Separate plugin loading functions on the user side.
 * This makes the plugin loading method changeable by user side use cases likes "require() on Node", "ajax on Browser".
 */
export default class PluginRegistry {
    private plugins: { [id: string]: PluginEntry } = Object.create(null)

    public registerPlugin(id: string, pluginDetail: PluginEntry) {
        if (this.plugins[id]) throw new Error('PluginID duplicated')
        this.plugins[id] = pluginDetail
    }

    public getPlugins(type?: PluginTypes): PluginEntry[] {
        if (type != null) {
            return Object.keys(this.plugins)
                .filter(id => this.plugins[id].type === type)
                .map(id => this.plugins[id])
        }

        return Object.keys(this.plugins).map(id => this.plugins[id])
    }

    public getPluginById(id: string, type: PluginTypes) {
        const pluginId = Object.keys(this.plugins).find(pluginId => (
            pluginId === id && this.plugins[pluginId].type === type
        ))

        return pluginId ? this.plugins[pluginId] : null
    }
}
