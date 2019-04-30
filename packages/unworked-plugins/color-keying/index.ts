import {
    // Type,
    // TypeDescriptor,
    LayerPluginBase,
    // PluginPreRenderRequest,
    RenderRequest,
    // Exceptions
} from '@delirvfx/core'

export default class CompositionLayer extends LayerPluginBase {
    public static pluginDidLoad() {}

    public async render(req: RenderRequest) {}
}
