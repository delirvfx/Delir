import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export default class AddAssetCommand implements Command {
    constructor(
        private addedAsset: Delir.Entity.Asset
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeAssetAction, { targetAssetId: this.addedAsset.id })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addAssetAction, { asset: this.addedAsset })
    }
}
