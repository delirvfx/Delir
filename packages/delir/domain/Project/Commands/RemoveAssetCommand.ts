import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveAssetCommand implements Command {
    constructor(private removedAsset: Delir.Entity.Asset) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addAssetAction, {
            asset: this.removedAsset,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeAssetAction, {
            targetAssetId: this.removedAsset.id,
        })
    }
}
