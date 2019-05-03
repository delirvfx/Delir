import * as Delir from '@delirvfx/core'
import { OperationContext } from '@ragg/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class AddLayerCommand implements Command {
    constructor(private targetCompositionId: string, private addedLayer: Delir.Entity.Layer, private index: number) {}

    public undo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.removeLayer, {
            targetLayerId: this.addedLayer.id,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.addLayer, {
            targetCompositionId: this.targetCompositionId,
            layer: this.addedLayer,
            index: this.index,
        })
    }

    private focusToParentComposition(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveComposition, {
            compositionId: this.targetCompositionId,
        })
    }
}
