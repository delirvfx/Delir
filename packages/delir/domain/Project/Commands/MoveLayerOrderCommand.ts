import * as _ from 'lodash'

import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class MoveLayerOrderCommand implements Command {
    constructor(
        private parentCompositionId: string,
        private targetLayerId: string,
        private previousIndex: number,
        private nextIndex: number,
    ) {}

    public undo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.moveLayerOrderAction, {
            parentCompositionId: this.parentCompositionId,
            targetLayerId: this.targetLayerId,
            newIndex: this.previousIndex,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.moveLayerOrderAction, {
            parentCompositionId: this.parentCompositionId,
            targetLayerId: this.targetLayerId,
            newIndex: this.nextIndex,
        })
    }

    private focusToParentComposition(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveCompositionAction, {
            compositionId: this.parentCompositionId,
        })
    }
}
