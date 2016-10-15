namespace Delir.Plugins {
    export interface IPluginEntry {
        getHeader(): Delir.Plugin.PluginHeader;
        getFactor(): any;
    }
}
