import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'
import _ from 'lodash'

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

    public undo(context: OperationContext) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.modifyKeyframe, {
            parentClipId: this.parentClipId,
            targetKeyframeId: this.targetKeyframeId,
            patch: this.toPreviousPatch,
        })
    }

    public redo(context: OperationContext) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.modifyKeyframe, {
            parentClipId: this.parentClipId,
            targetKeyframeId: this.targetKeyframeId,
            patch: this.patch,
        })
    }

    private focusToChangedParam(context: OperationContext) {
        context.dispatch(EditorActions.changeActiveParam, {
            target: {
                type: 'clip',
                entityId: this.parentClipId,
                paramName: this.paramName,
            },
        })
    }
}
