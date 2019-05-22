import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveAssetCommand implements Command {
    constructor(private removedAsset: Delir.Entity.Asset) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addAsset, {
            asset: this.removedAsset,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeAsset, {
            targetAssetId: this.removedAsset.id,
        })
    }
}
