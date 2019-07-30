import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'

import { EditorActions } from '../../Editor/actions'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class RemoveKeyframeCommand implements Command {
  constructor(
    private parentClipId: string,
    private paramName: string,
    private removedKeyframe: Delir.Entity.Keyframe,
  ) {}

  public undo(context: OperationContext) {
    this.focusToChangedParam(context)

    context.dispatch(ProjectActions.addKeyframe, {
      targetClipId: this.parentClipId,
      paramName: this.paramName,
      keyframe: this.removedKeyframe,
    })
  }

  public redo(context: OperationContext) {
    this.focusToChangedParam(context)

    context.dispatch(ProjectActions.removeKeyframe, {
      parentClipId: this.parentClipId,
      paramName: this.paramName,
      targetKeyframeId: this.removedKeyframe.id,
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
