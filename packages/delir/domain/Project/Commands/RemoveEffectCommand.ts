import * as Delir from '@ragg/delir-core'
import { OperationContext } from '@ragg/fleur'

import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveEffectCommand implements Command {
    constructor(
        private holderClipId: string,
        private removedEffect: Delir.Entity.Effect,
        private beforeRemoveIndex: number,
    ) {}

    public undo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.addEffectIntoClipAction, {
            clipId: this.holderClipId,
            effect: this.removedEffect,
            index: this.beforeRemoveIndex,
        })
    }

    public redo(context: OperationContext<any>) {
        context.dispatch(ProjectActions.removeKeyframeAction, {
            targetKeyframeId: this.removedEffect.id,
        })
    }
}
