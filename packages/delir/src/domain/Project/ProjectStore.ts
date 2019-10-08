import * as Delir from '@delirvfx/core'
import { listen, Store } from '@fleur/fleur'

import { EditorActions } from '../Editor/actions'
import { ProjectActions } from './actions'

export interface ProjectStoreState {
  project: Delir.Entity.Project | null
  lastChangeTime: number
}

export default class ProjectStore extends Store<ProjectStoreState> {
  public static storeName = 'ProjectStore'

  public state: ProjectStoreState = {
    project: null,
    lastChangeTime: 0,
  }

  private handleSetActiveProject = listen(EditorActions.setActiveProject, ({ project }) => {
    this.updateWith(d => (d.project = project as any))
  })

  private handleClearActiveProject = listen(EditorActions.clearActiveProject, payload => {
    this.updateWith(d => (d.project = null))
  })

  private handleCreateComposition = listen(ProjectActions.createComposition, payload => {
    this.updateWith(({ project }) => project!.addComposition(payload.composition))
    this.updateLastModified()
  })

  private handleAddLayer = listen(ProjectActions.addLayer, ({ targetCompositionId, layer, index }) => {
    this.updateWith(({ project }) => project!.findComposition(targetCompositionId)!.addLayer(layer, index))
    this.updateLastModified()
  })

  private handleAddClip = listen(ProjectActions.addClip, ({ targetLayerId, newClip }) => {
    this.updateWith(({ project }) => project!.findLayer(targetLayerId)!.addClip(newClip))
    this.updateLastModified()
  })

  private handleAddLayerWithAsset = listen(
    ProjectActions.addLayerWithAsset,
    ({ targetCompositionId, clip, asset, layer }) => {
      const { project } = this.state
      const paramName = Delir.Engine.Renderers.getInfo(clip.renderer).assetAssignMap[asset.fileType]

      if (paramName == null) return

      const keyframe = new Delir.Entity.Keyframe({
        frameOnClip: 0,
        value: { assetId: asset.id },
      })

      this.updateWith(({ project }) => {
        clip.addKeyframe(paramName, keyframe)
        layer.addClip(clip)
        project!.findComposition(targetCompositionId)!.addLayer(layer)
      })
      this.updateLastModified()
    },
  )

  private handleAddAsset = listen(ProjectActions.addAsset, ({ asset }) => {
    this.updateWith(({ project }) => project!.addAsset(asset))
    this.updateLastModified()
  })

  private handleAddKeyframe = listen(ProjectActions.addKeyframe, ({ targetClipId, paramName, keyframe }) => {
    this.updateWith(({ project }) => project!.findClip(targetClipId)!.addKeyframe(paramName, keyframe))
    this.updateLastModified()
  })

  private handleAddEffectIntoClipPayload = listen(ProjectActions.addEffectIntoClip, ({ clipId, effect, index }) => {
    this.updateWith(({ project }) => project!.findClip(clipId)!.addEffect(effect, index))
    this.updateLastModified()
  })

  private handleAddEffectKeyframe = listen(
    ProjectActions.addEffectKeyframe,
    ({ targetClipId, targetEffectId, paramName, keyframe }) => {
      this.updateWith(({ project }) => {
        project!
          .findClip(targetClipId)!
          .findEffect(targetEffectId)!
          .addKeyframe(paramName, keyframe)
      })
      this.updateLastModified()
    },
  )

  private handleMoveClipToLayer = listen(ProjectActions.moveClipToLayer, ({ clipId, destLayerId }) => {
    this.updateWith(({ project }) => {
      const sourceLayer = project!.findClipOwnerLayer(clipId)
      const destLayer = project!.findLayer(destLayerId)
      sourceLayer!.moveClipIntoLayer(clipId, destLayer!)
    })
    this.updateLastModified()
  })

  private handleModifyComposition = listen(ProjectActions.modifyComposition, ({ targetCompositionId, patch }) => {
    this.updateWith(({ project }) => {
      project!.findComposition(targetCompositionId)!.patch(patch)
    })
    this.updateLastModified()
  })

  private handleModifyLayer = listen(ProjectActions.modifyLayer, ({ targetLayerId, patch }) => {
    this.updateWith(({ project }) => project!.findLayer(targetLayerId)!.patch(patch))
    this.updateLastModified()
  })

  private handleModifyClips = listen(ProjectActions.modifyClips, ({ patches }) => {
    this.updateWith(({ project }) => {
      patches.forEach(({ clipId, patch }) => {
        project!.findClip(clipId)!.patch(patch)
      })
    })

    this.updateLastModified()
  })

  private handleModifyEffect = listen(ProjectActions.modifyEffect, ({ parentClipId, targetEffectId, patch }) => {
    this.updateWith(({ project }) => {
      project!
        .findClip(parentClipId)!
        .findEffect(targetEffectId)!
        .patch(patch)
    })
    this.updateLastModified()
  })

  private handleModifyClipExpression = listen(
    ProjectActions.modifyClipExpression,
    ({ targetClipId, targetParamName, expression }) => {
      this.updateWith(({ project }) => project!.findClip(targetClipId)!.setExpression(targetParamName, expression))
      this.updateLastModified()
    },
  )

  private handleModifyEffectExpression = listen(
    ProjectActions.modifyEffectExpression,
    ({ targetClipId, targetEffectId, paramName, expression }) => {
      this.updateWith(({ project }) => {
        project!
          .findClip(targetClipId)!
          .findEffect(targetEffectId)!
          .setExpression(paramName, expression)
      })
      this.updateLastModified()
    },
  )

  private handleModifyKeyframe = listen(ProjectActions.modifyKeyframe, ({ parentClipId, targetKeyframeId, patch }) => {
    this.updateWith(({ project }) => {
      project!
        .findClip(parentClipId)!
        .findKeyframe(targetKeyframeId)!
        .patch(patch)
    })
    this.updateLastModified()
  })

  private handleModifyEffectKeyframe = listen(
    ProjectActions.modifyEffectKeyframe,
    ({ targetClipId, effectId, targetKeyframeId, patch }) => {
      this.updateWith(({ project }) => {
        project!
          .findClip(targetClipId)!
          .findEffect(effectId)!
          .findKeyframe(targetKeyframeId)!
          .patch(patch)
      })
      this.updateLastModified()
    },
  )

  private handleMoveLayerOrder = listen(
    ProjectActions.moveLayerOrder,
    ({ parentCompositionId, targetLayerId, newIndex }) => {
      this.updateWith(({ project }) =>
        project!.findComposition(parentCompositionId)!.moveLayerIndex(targetLayerId, newIndex),
      )
      this.updateLastModified()
    },
  )

  private handleMoveEffectOrder = listen(
    ProjectActions.moveEffectOrder,
    ({ parentClipId, subjectEffectId, newIndex }) => {
      this.updateWith(({ project }) => project!.findClip(parentClipId)!.moveEffectIndex(subjectEffectId, newIndex))
      this.updateLastModified()
    },
  )

  private handleRemoveComposition = listen(ProjectActions.removeComposition, ({ targetCompositionId }) => {
    this.updateWith(({ project }) => project!.removeComposition(targetCompositionId))
    this.updateLastModified()
  })

  private handleRemoveLayer = listen(ProjectActions.removeLayer, ({ targetLayerId }) => {
    this.updateWith(({ project }) => project!.findLayerOwnerComposition(targetLayerId)!.removeLayer(targetLayerId))
    this.updateLastModified()
  })

  private handleRemoveClip = listen(ProjectActions.removeClip, ({ targetClipId }) => {
    this.updateWith(({ project }) => project!.findClipOwnerLayer(targetClipId)!.removeClip(targetClipId))
    this.updateLastModified()
  })

  private handleRemoveAsset = listen(ProjectActions.removeAsset, ({ targetAssetId }) => {
    this.updateWith(({ project }) => project!.removeAsset(targetAssetId))
    this.updateLastModified()
  })

  private handleRemoveKeyframe = listen(
    ProjectActions.removeKeyframe,
    ({ parentClipId, paramName, targetKeyframeId }) => {
      this.updateWith(({ project }) => project!.findClip(parentClipId)!.removeKeyframe(paramName, targetKeyframeId))
      this.updateLastModified()
    },
  )

  private handleRemoveEffectKeyframe = listen(
    ProjectActions.removeEffectKeyframe,
    ({ clipId, effectId, paramName, targetKeyframeId }) => {
      this.updateWith(({ project }) => {
        project!
          .findClip(clipId)!
          .findEffect(effectId)!
          .removeKeyframe(paramName, targetKeyframeId)
      })
      this.updateLastModified()
    },
  )

  private handleRemoveEffectFromClip = listen(
    ProjectActions.removeEffectFromClip,
    ({ holderClipId, targetEffectId }) => {
      this.updateWith(({ project }) => project!.findClip(holderClipId)!.removeEffect(targetEffectId))
      this.updateLastModified()
    },
  )

  public getState() {
    return this.state
  }

  public getProject() {
    return this.state.project
  }

  public findClip(clipId: string) {
    return this.state.project!.findClip(clipId)
  }

  private updateLastModified = () => {
    // Projectの変更は検知できないし、構造が大きくなる可能性があるので今のところImmutableにもしたくない
    this.updateWith(d => (d.lastChangeTime = Date.now()))
  }
}
