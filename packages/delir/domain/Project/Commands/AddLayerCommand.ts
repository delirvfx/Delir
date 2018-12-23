import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class AddLayerCommand implements Command {
    constructor(private targetCompositionId: string, private addedLayer: Delir.Entity.Layer) {}

    public undo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.removeLayerAction, {
            targetLayerId: this.addedLayer.id,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.addLayerAction, {
            targetCompositionId: this.targetCompositionId,
            layer: this.addedLayer,
        })
    }

    private focusToParentComposition(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveCompositionAction, {
            compositionId: this.targetCompositionId,
        })
    }
}
