import * as Delir from '@delirvfx/core'
import { OperationContext } from '@ragg/fleur'
import * as _ from 'lodash'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export type ModifyClipsPatches = {
    clipId: string
    unpatched: Partial<Delir.Entity.Clip>
    patch: Partial<Delir.Entity.Clip>
}[]

export class ModifyClipsCommand implements Command {
    private patches: {
        clipId: string
        undoPatch: Partial<Delir.Entity.Clip>
        redoPatch: Partial<Delir.Entity.Clip>
    }[]

    constructor(private parentCompositionId: string, patches: ModifyClipsPatches) {
        this.patches = patches.map(({ clipId, unpatched, patch }) => {
            return {
                clipId: clipId,
                undoPatch: _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Clip>,
                redoPatch: patch,
            }
        })
    }

    public undo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.modifyClipsAction, {
            patches: this.patches.map(({ clipId, undoPatch }) => ({ clipId, patch: undoPatch })),
        })
    }

    public redo(context: OperationContext<any>) {
        this.focusToParentComposition(context)

        context.dispatch(ProjectActions.modifyClipsAction, {
            patches: this.patches.map(({ clipId, redoPatch }) => ({ clipId, patch: redoPatch })),
        })
    }

    private focusToParentComposition(context: OperationContext<any>) {
        context.dispatch(EditorActions.changeActiveCompositionAction, {
            compositionId: this.parentCompositionId,
        })
    }
}
