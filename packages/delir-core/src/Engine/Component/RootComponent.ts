import { Clip, Composition, Layer } from '../../Document'
import DocumentOperator from '../../DocumentOperator'
import ClipComponent from './ClipComponent'
import CompositionComponent from './CompositionComponent'
import EffectComponent from './EffectComponent'
import LayerComponent from './LayerComponent'

export default class RootComponent {
    private docOp: DocumentOperator
    public composition: CompositionComponent

    constructor(docOp: DocumentOperator, composition: Composition) {
        this.docOp = docOp
        this.composition = new CompositionComponent(composition)

        // Building layer component tree
        this.composition.layers = this.buildLayerComponentsTree(composition)
    }

    public async activate() {
        this.composition.didActivate()
     }

    public async deactivate() {
        this.composition.didDeactivate()
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
