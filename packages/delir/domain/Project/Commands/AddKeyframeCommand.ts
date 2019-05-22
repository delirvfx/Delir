import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class AddKeyframeCommand implements Command {
    constructor(
        private targetClipId: string,
        private paramName: string,
        private addedKeyframe: Delir.Entity.Keyframe,
    ) {}

    public undo(context: OperationContext) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.removeKeyframe, {
            parentClipId: this.targetClipId,
            paramName: this.paramName,
            targetKeyframeId: this.addedKeyframe.id,
        })
    }

    public redo(context: OperationContext) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.addKeyframe, {
            targetClipId: this.targetClipId,
            paramName: this.paramName,
            keyframe: this.addedKeyframe,
        })
    }

    private focusToChangedParam(context: OperationContext) {
        context.dispatch(EditorActions.changeActiveParam, {
            target: {
                type: 'clip',
                entityId: this.targetClipId,
                paramName: this.paramName,
            },
        })
    }
}
