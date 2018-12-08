import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'
import * as _ from 'lodash'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyEffectKeyframeCommand implements Command {
    private toPreviousPatch: Partial<Delir.Entity.Keyframe>

    constructor(
        private targetClipId: string,
        private targetEffectId: string,
        private paramName: string,
        private targetKeyframeId: string,
        unpatched: Partial<Delir.Entity.Keyframe>,
        private patch: Partial<Delir.Entity.Keyframe>,
    ) {
        this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Keyframe>
    }

    public undo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.modifyEffectKeyframeAction, {
            targetClipId: this.targetClipId,
            effectId: this.targetEffectId,
            targetKeyframeId: this.targetKeyframeId,
            patch: this.toPreviousPatch,
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToChangedParam(context)

        context.dispatch(ProjectActions.modifyEffectKeyframeAction, {
            targetClipId: this.targetClipId,
            effectId: this.targetEffectId,
            targetKeyframeId: this.targetKeyframeId,
            patch: this.patch,
        })
    }

    private focusToChangedParam(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveParamAction, {
            target: {
                type: 'effect',
                entityId: this.targetEffectId,
                paramName: this.paramName,
            },
        })
    }
}
