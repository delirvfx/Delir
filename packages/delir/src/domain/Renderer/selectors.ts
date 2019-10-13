import { selectorWithStore } from '@fleur/fleur'
import RendererStore from './RendererStore'

export const getLoadedPlugins = selectorWithStore(getStore => getStore(RendererStore).getPostEffectPlugins())
