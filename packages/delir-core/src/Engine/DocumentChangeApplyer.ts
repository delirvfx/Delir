import DocumentOperator, { OperationEvents } from '../DocumentOperator'
import Engine from '../Engine/Engine'

/**
 * Handle side effects on engine internal component tree due to document change event.
 * @see ./Component/README.md
 */
export default class DocumentChangeApplyer {
    constructor(
        private docOp: DocumentOperator,
        private engine: Engine
    ) {
        docOp.on('asset:add', this.handleAssetAdd)
        docOp.on('asset:remove', this.handleRemoveAsset)
        docOp.on('composition:add', this.handleAddComposition)
        docOp.on('composition:remove', this.handleRemoveComposition)
        docOp.on('layer:add', this.handleAddLayer)
        docOp.on('layer:remove', this.handleRemoveLayer)
        docOp.on('clip:add', this.handleAddClip)
        docOp.on('clip:remove', this.handleRemoveClip)
        docOp.on('effect:add', this.handleAddEffect)
        docOp.on('effect:remove', this.handleRemoveEffect)
    }

    private get treeRoot() { return this.engine._componentTree }

    private readonly handleAssetAdd = () => {

    }

    private readonly handleRemoveAsset = () => {

    }

    private readonly handleAddComposition = () => {
        // noop
    }

    private readonly handleRemoveComposition = async ({ id }: OperationEvents['composition:remove']) => {
        if (this.treeRoot!.composition.id !== id) return
        await this.treeRoot!.deactivate()
    }

    private readonly handleAddLayer = () => {
        // noop
    }

    private readonly handleRemoveLayer = async ({ id }: OperationEvents['layer:remove']) => {
        const { layers } = this.treeRoot!.composition
        const removedIndex = layers.findIndex(layerComp => layerComp.id === id)

        if (removedIndex === -1) return

        const [ layerComp ] = layers.splice(removedIndex, 1)
        await layerComp.deactivate()
    }

    private readonly handleAddClip = () => {

    }

    private readonly handleRemoveClip = async ({ id }: OperationEvents['clip:remove']) => {
        // const { clips } =
    }

    private readonly handleAddEffect = () => {

    }

    private readonly handleRemoveEffect = () => {

    }
}
