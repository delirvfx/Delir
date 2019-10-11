import _ from 'lodash'

import * as Delir from '@delirvfx/core'
import { OperationContext } from '@fleur/fleur'
import { Command } from '../../History/HistoryStore'
import { ProjectActions } from '../actions'

export class ModifyAssetCommand implements Command {
  private toPreviousPatch: Partial<Delir.Entity.Asset>

  constructor(
    private subjectAssetId: string,
    unpatched: Partial<Delir.Entity.Asset>,
    private patch: Partial<Delir.Entity.Asset>,
  ) {
    this.toPreviousPatch = _.pick(unpatched, Object.keys(patch)) as Partial<Delir.Entity.Asset>
  }

  public undo(context: OperationContext) {
    context.dispatch(ProjectActions.modifyAsset, {
      assetId: this.subjectAssetId,
      patch: this.toPreviousPatch,
    })
  }

  public redo(context: OperationContext) {
    context.dispatch(ProjectActions.modifyAsset, {
      assetId: this.subjectAssetId,
      patch: this.patch,
    })
  }
}
