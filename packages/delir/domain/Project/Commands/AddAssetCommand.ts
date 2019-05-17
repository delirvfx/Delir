import * as Delir from '@delirvfx/core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class AddAssetCommand implements Command {
    constructor(private addedAsset: Delir.Entity.Asset) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeAsset, {
            targetAssetId: this.addedAsset.id,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addAsset, {
            asset: this.addedAsset,
        })
    }
}
