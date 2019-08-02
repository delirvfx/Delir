import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveClipCommand implements Command {
  constructor(
    private parentLayerId: string,
    private removedClip: Delir.Entity.Clip,
    private parentCompositionId: string,
  ) {}

  public undo(context: OperationContext) {
    this.focusToParentComposition(context)

    context.dispatch(ProjectActions.addClip, {
      targetLayerId: this.parentLayerId,
      newClip: this.removedClip,
    })
  }

  public redo(context: OperationContext) {
    this.focusToParentComposition(context)

    context.dispatch(ProjectActions.removeClip, {
      targetClipId: this.removedClip.id,
    })
  }

  private focusToParentComposition(context: OperationContext) {
    context.dispatch(EditorActions.changeActiveComposition, {
      compositionId: this.parentCompositionId,
    })
  }
}
