import ClipComponent from './Component/ClipComponent'
import CompositionComponent from './Component/CompositionComponent'
import LayerComponent from './Component/LayerComponent'
import ComponentRoot from './ComponentRoot'
import CompositionScopeFrameContext from './FrameContext/ClipScopeFrameContext'

interface TargetsTree {
    /** target clips each layer, null if clip not exists on layer at a frame */
    layers: (ClipComponent | null)[]
}

/**
 * Find and holding rendering target Component at a frame.
 */
export default class TargetComponentFinder
{
    public targets: TargetsTree

    constructor(
        private tree: ComponentRoot,
        private context: CompositionScopeFrameContext,
    ) { }

    public findTargetClips(): void {
        this.targets = {
            layers: this.findTargetClipFromComposition(this.tree.composition),
        }
    }

    private findTargetClipFromComposition(composition: CompositionComponent): any {
        return composition.layers.map(layer => this.findTargetClipFromLayer(layer))
    }

    private findTargetClipFromLayer(layer: LayerComponent): ClipComponent | null {
        const { frameOnComposition } = this.context

        // Find by `.frameOnComposition`, not `.frame`
        // For support nested composition in the future.
        return layer.clips.find(({ ref: clip }) => (
            clip.placedFrame <= frameOnComposition
                && (clip.placedFrame + clip.durationFrames) > frameOnComposition
        )) || null
    }
}
