import DocumentOperator from '../DocumentOperator'
import Engine from '../Engine/Engine'

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

    private readonly handleAssetAdd = () => {

    }

    private readonly handleRemoveAsset = () => {

    }

    private readonly handleAddComposition = () => {

    }

    private readonly handleRemoveComposition = () => {

    }

    private readonly handleAddLayer = () => {

    }

    private readonly handleRemoveLayer = () => {

    }

    private readonly handleAddClip = () => {

    }

    private readonly handleRemoveClip = () => {

    }

    private readonly handleAddEffect = () => {

    }

    private readonly handleRemoveEffect = () => {

    }
}
