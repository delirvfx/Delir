export enum PluginTypes {
    postEffect = 'PostEffect'
}

export interface PluginEntry {
    id: string
    type: PluginTypes
    version: string
    author: string | string[]
}

export default class PluginRegistry {
    private plugins: { [id: string]: PluginEntry } = Object.create(null)

    public getPlugins(type?: PluginTypes): PluginEntry[] {
        if (type != null) {
            return Object.keys(this.plugins)
                .filter(id => this.plugins[id].type === type)
                .map(id => this.plugins[id])
        }

        return Object.keys(this.plugins).map(id => this.plugins[id])
    }

    public registerPlugin(id: string, pluginDetail: any) {
        if (this.plugins[id]) throw new Error('PluginID duplicated')
        this.plugins[id] = pluginDetail
    }

    public getPluginById(id: string) {
        return this.plugins[id]
    }
}
