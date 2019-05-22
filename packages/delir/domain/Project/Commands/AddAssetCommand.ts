import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class AddAssetCommand implements Command {
    constructor(private addedAsset: Delir.Entity.Asset) {}

    public undo(context: OperationContext) {
        context.dispatch(ProjectActions.removeAsset, {
            targetAssetId: this.addedAsset.id,
        })
    }

    public redo(context: OperationContext) {
        context.dispatch(ProjectActions.addAsset, {
            asset: this.addedAsset,
        })
    }
}
