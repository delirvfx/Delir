import * as Delir from '@delirvfx/core'
import { OperationContext } from '@ragg/fleur'
import * as _ from 'lodash'

import { EditorActions } from '../../Editor/actions'
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
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.modifyClipExpressionAction, {
            targetClipId: this.targetClipId,
            targetParamName: this.paramName,
            expression: this.previousValue,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.modifyClipExpressionAction, {
            targetClipId: this.targetClipId,
            targetParamName: this.paramName,
            expression: this.nextValue,
        })
    }

    private focusToChangedParam(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveParamAction, {
            target: {
                type: 'clip',
                entityId: this.targetClipId,
                paramName: this.paramName,
            },
        })
    }
}
