import { Clip, Composition, Layer } from '../Document'
import DocumentOperator from '../DocumentOperator'
import ClipComponent from './Component/ClipComponent'
import CompositionComponent from './Component/CompositionComponent'
import EffectComponent from './Component/EffectComponent'
import LayerComponent from './Component/LayerComponent'

export default class ComponentRoot {
    private docOp: DocumentOperator
    public composition: CompositionComponent

    constructor(docOp: DocumentOperator, composition: Composition) {
        this.docOp = docOp
        this.composition = new CompositionComponent(composition)

        // Building layer component tree
        this.composition.layers = this.buildLayerComponentsTree(composition)
    }

    public async activate() {
        this.composition.activate()
     }

    public async deactivate() {
        this.composition.deactivate()
     }

    private buildLayerComponentsTree(composition: Composition) {
        return composition.layers.map(layerId => {
            const layer = this.docOp.getLayer(layerId)
            if (!layer) throw new Error(`Component tree building failed: layer (${layerId}) not fround`)

            const layerComponent = new LayerComponent(layer)
            layerComponent.clips = this.buildClipComponentsTree(layer)

            return layerComponent
        })
    }

    private buildClipComponentsTree(layer: Layer) {
        return layer.clips.map(clipId => {
            const clip = this.docOp.getClip(clipId)
            if (!clip) throw new Error(`Component tree building failed: clip (${clipId}) not fround`)

            const clipComponent = new ClipComponent(clip)
            clipComponent.effects = this.buildEffectComponentsTree(clip)

            return clipComponent
        })
    }

    private buildEffectComponentsTree(clip: Clip) {
        return clip.effects.map(effectId => {
            const effect = this.docOp.getEffect(effectId)
            if (!effect) throw new Error(`Component tree building failed: clip (${clipId}) not fround`)

            const effectComponent = new EffectComponent(effect)
            return effectComponent
        })
    }
}