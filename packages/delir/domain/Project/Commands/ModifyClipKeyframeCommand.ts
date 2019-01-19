import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import * as _ from 'lodash'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyClipKeyframeCommand implements Command {
    private toPreviousPatch: Partial<Delir.Entity.Keyframe>

    constructor(
        private targetKeyframeId: string,
        unpatched: Partial<Delir.Entity.Keyframe>,
        private patch: Partial<Delir.Entity.Keyframe>,
        private parentClipId: string,
        private paramName: string,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Keyframe>
    }

    public undo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.modifyKeyframeAction, {
            parentClipId: this.parentClipId,
            targetKeyframeId: this.targetKeyframeId,
            patch: this.toPreviousPatch,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.modifyKeyframeAction, {
            parentClipId: this.parentClipId,
            targetKeyframeId: this.targetKeyframeId,
            patch: this.patch,
        })
    }

    private focusToChangedParam(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveParamAction, {
            target: {
                type: 'clip',
                entityId: this.parentClipId,
                paramName: this.paramName,
            },
        })
    }
}
