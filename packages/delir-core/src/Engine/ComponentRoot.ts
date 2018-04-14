import { Clip, Composition, Layer } from '../Document'
import DocumentOperator from '../DocumentOperator'
import ClipComponent from './Component/ClipComponent'
import CompositionComponent from './Component/CompositionComponent'
import EffectComponent from './Component/EffectComponent'
import LayerComponent from './Component/LayerComponent'

/**
 * Builder from Document to Component tree
 */
export default class ComponentRoot {
    public composition: CompositionComponent
    private docOp: DocumentOperator

    constructor(docOp: DocumentOperator, composition: Composition) {
        this.docOp = docOp
        this.composition = new CompositionComponent(composition)

        // Building layer component tree
        this.composition.layers = this.buildLayerComponentsTree(composition)
    }

    public async activate(): Promise<void> {
        this.composition.activate()
     }

    public async deactivate(): Promise<void> {
        this.composition.deactivate()
     }

    private buildLayerComponentsTree(composition: Composition): LayerComponent[] {
        return composition.layers.map(layerId => {
            const layer = this.docOp.getLayer(layerId)
            if (!layer) throw new Error(`Component tree building failed: layer (${layerId}) not fround`)

            const layerComponent = new LayerComponent(layer)
            layerComponent.clips = this.buildClipComponentsTree(layer)

            return layerComponent
        })
    }

    private buildClipComponentsTree(layer: Layer): ClipComponent[] {
        // The assumption that `layer.clips` is sorted in ascending order.
        return layer.clips.map(clipId => {
            const clip = this.docOp.getClip(clipId)
            if (!clip) throw new Error(`Component tree building failed: clip (${clipId}) not fround`)

            const clipComponent = new ClipComponent(clip)
            clipComponent.effects = this.buildEffectComponentsTree(clip)

            return clipComponent
        })
    }

    private buildEffectComponentsTree(clip: Clip): EffectComponent[] {
        return clip.effects.map(effectId => {
            const effect = this.docOp.getEffect(effectId)
            if (!effect) throw new Error(`Component tree building failed: clip (${clipId}) not fround`)

            const effectComponent = new EffectComponent(effect)
            return effectComponent
        })
    }
}
