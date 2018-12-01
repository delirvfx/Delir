import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class AddKeyframeCommand implements Command {
    constructor(
        private targetClipId: Delir.Entity.Clip.Id,
        private paramName: string,
        private addedKeyframe: Delir.Entity.Keyframe
    ) {}

    public undo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.removeKeyframeAction, {
            parentClipId: this.targetClipId,
            paramName: this.paramName,
            targetKeyframeId: this.addedKeyframe.id,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.addKeyframeAction, {
            targetClipId: this.targetClipId,
            paramName: this.paramName,
            keyframe: this.addedKeyframe,
        })
    }

    private focusToChangedParam(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveParamAction, {
            target: {
                type: 'clip',
                entityId: this.targetClipId,
                paramName: this.paramName,
            }
        })
    }
}
