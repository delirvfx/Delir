import * as _ from 'lodash'

import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyClipExpressionCommand implements Command {
    constructor(
        private targetClipId: string,
        private paramName: string,
        private previousValue: Delir.Values.Expression | null,
        private nextValue: Delir.Values.Expression,
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyClipExpressionAction, {
            targetClipId: this.targetClipId,
            targetProperty: this.paramName,
            expression: this.previousValue,
         })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyClipExpressionAction, {
            targetClipId: this.targetClipId,
            targetProperty: this.paramName,
            expression: this.nextValue,
        })
    }
}
