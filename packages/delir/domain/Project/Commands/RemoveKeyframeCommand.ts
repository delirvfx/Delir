import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveKeyframeCommand implements Command {
    constructor(
        private parentClipId: string,
        private paramName: string,
        private removedKeyframe: Delir.Entity.Keyframe,
    ) {}

    public undo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.addKeyframeAction, {
            targetClipId: this.parentClipId,
            paramName: this.paramName,
            keyframe: this.removedKeyframe,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.removeKeyframeAction, {
            targetKeyframeId: this.removedKeyframe.id,
        })
    }

    private focusToChangedParam(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveParamAction, {
            target: {
                type: 'clip',
                entityId: this.parentClipId,
                paramName: this.paramName,
            }
        })
    }
}
