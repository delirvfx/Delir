import _ from 'lodash'

import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'
import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class MoveLayerOrderCommand implements Command {
  constructor(
    private parentCompositionId: string,
    private targetLayerId: string,
    private previousIndex: number,
    private nextIndex: number,
  ) {}

  public undo(context: OperationContext) {
    this.focusToParentComposition(context)

    context.dispatch(ProjectActions.moveLayerOrder, {
      parentCompositionId: this.parentCompositionId,
      targetLayerId: this.targetLayerId,
      newIndex: this.previousIndex,
    })
  }

  public redo(context: OperationContext) {
    this.focusToParentComposition(context)

    context.dispatch(ProjectActions.moveLayerOrder, {
      parentCompositionId: this.parentCompositionId,
      targetLayerId: this.targetLayerId,
      newIndex: this.nextIndex,
    })
  }

  private focusToParentComposition(context: OperationContext) {
    context.dispatch(EditorActions.changeActiveComposition, {
      compositionId: this.parentCompositionId,
    })
  }
}
