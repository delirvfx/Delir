import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveLayerCommand implements Command {
  constructor(
    private parentCompositionId: string,
    private removedLayer: Delir.Entity.Layer,
    private beforeRemoveIndex: number,
  ) {}

  public undo(context: OperationContext) {
    this.focusToParentComposition(context)

    context.dispatch(ProjectActions.addLayer, {
      targetCompositionId: this.parentCompositionId,
      layer: this.removedLayer,
      index: this.beforeRemoveIndex,
    })
  }

  public redo(context: OperationContext) {
    this.focusToParentComposition(context)

    context.dispatch(ProjectActions.removeLayer, {
      targetLayerId: this.removedLayer.id,
    })
  }

  private focusToParentComposition(context: OperationContext) {
    context.dispatch(EditorActions.changeActiveComposition, {
      compositionId: this.parentCompositionId,
    })
  }
}
