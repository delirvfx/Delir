import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'
import _ from 'lodash'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyLayerCommand implements Command {
  private toPreviousPatch: Partial<Delir.Entity.Layer>

  constructor(
    private subjectLayerId: string,
    unpatched: Partial<Delir.Entity.Layer>,
    private patch: Partial<Delir.Entity.Layer>,
    private parentCompositionId: string,
  ) {
    this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Layer>
  }

  public undo(context: OperationContext) {
    this.focusToParentComposition(context)

    context.dispatch(ProjectActions.modifyLayer, {
      targetLayerId: this.subjectLayerId,
      patch: this.toPreviousPatch,
    })
  }

  public redo(context: OperationContext) {
    this.focusToParentComposition(context)

    context.dispatch(ProjectActions.modifyLayer, {
      targetLayerId: this.subjectLayerId,
      patch: this.patch,
    })
  }

  private focusToParentComposition(context: OperationContext) {
    context.dispatch(EditorActions.changeActiveComposition, {
      compositionId: this.parentCompositionId,
    })
  }
}
