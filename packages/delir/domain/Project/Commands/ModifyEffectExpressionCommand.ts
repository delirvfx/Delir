import * as _ from 'lodash'

import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyEffectExpressionCommand implements Command {
    constructor(
        private targetClipId: string,
        private effectId: string,
        private paramName: string,
        private previousValue: Delir.Values.Expression | null,
        private nextValue: Delir.Values.Expression,
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyEffectExpressionAction, {
            targetClipId: this.targetClipId,
            targetEffectId: this.effectId,
            paramName: this.paramName,
            expression: this.previousValue,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.modifyEffectExpressionAction, {
            targetClipId: this.targetClipId,
            targetEffectId: this.effectId,
            paramName: this.paramName,
            expression: this.nextValue,
        })
    }
}
