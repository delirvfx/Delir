import * as Delir from '@ragg/delir-core'
import { listen, Store } from '@ragg/fleur'

import { EditorActions } from '../Editor/actions'
import { ProjectActions } from './actions'

export interface ProjectStoreState {
    project: Delir.Entity.Project | null,
    lastChangeTime: number,
}

export default class ProjectStore extends Store<ProjectStoreState>
{
    public static storeName = 'ProjectStore'

    protected state: ProjectStoreState = {
        project: null,
        lastChangeTime: 0,
    }

    private handleSetActiveProject = listen(EditorActions.setActiveProjectAction, ({project}) => {
        this.updateWith(d => d.project = project as any)
    })

    private handleClearActiveProject = listen(EditorActions.clearActiveProjectAction, (payload) => {
        this.updateWith(d => d.project = null)
    })

    private handleCreateComposition = listen(ProjectActions.createCompositionAction, (payload) => {
        const { project } = this.state
        project!.addComposition(payload.composition)
        this.updateLastModified()
    })

    private handleAddLayer = listen(ProjectActions.addLayerAction, ({targetCompositionId, layer}) => {
        const { project } = this.state
        project!.findComposition(targetCompositionId)!.addLayer(layer)
        this.updateLastModified()
    })

    private handleAddClip = listen(ProjectActions.addClipAction, ({ targetLayerId, newClip }) => {
        const { project } = this.state
        project!.findLayer(targetLayerId)!.addClip(newClip)
        this.updateLastModified()
    })

    private handleAddLayerWithAsset = listen(ProjectActions.addLayerWithAssetAction, ({ targetComposition, clip, asset, layer }) => {
        const { project } = this.state
        const paramName = Delir.Engine.Renderers.getInfo(clip.renderer).assetAssignMap[asset.fileType]

        if (paramName == null) return

        const keyframe = new Delir.Entity.Keyframe({
            frameOnClip: 0,
            value: { assetId: asset.id }
        })

        clip.addKeyframe(paramName, keyframe)
        layer.addClip(clip)
        project!.findComposition(targetComposition.id)!.addLayer(layer)
        this.updateLastModified()
    })

    private handleAddAsset = listen(ProjectActions.addAssetAction, ({asset}) => {
        const { project } = this.state
        project!.addAsset(asset)
        this.updateLastModified()
    })

    private handleAddKeyframe = listen(ProjectActions.addKeyframeAction, ({ targetClipId, paramName, keyframe }) => {
        const { project } = this.state
        project!.findClip(targetClipId)!.addKeyframe(paramName, keyframe)
        this.updateLastModified()
    })

    private handleAddEffectIntoClipPayload = listen(ProjectActions.addEffectIntoClipAction, ({ clipId, effect, index }) => {
        const { project } = this.state
        project!.findClip(clipId)!.addEffect(effect, index)
        this.updateLastModified()
    })

    private handleAddEffectKeyframe = listen(ProjectActions.addEffectKeyframeAction, ({ targetClipId, targetEffectId, paramName, keyframe }) => {
        const { project } = this.state
        project!.findClip(targetClipId)!.findEffect(targetEffectId)!.addKeyframe(paramName, keyframe)
        this.updateLastModified()
    })

    private handleMoveClipToLayer = listen(ProjectActions.moveClipToLayerAction, ({clipId, destLayerId}) => {
        const { project } = this.state
        const sourceLayer = project!.findClipOwnerLayer(clipId)
        const destLayer = project!.findLayer(destLayerId)
        sourceLayer!.moveClipIntoLayer(clipId, destLayer!)
        this.updateLastModified()
    })

    private handleModifyComposition = listen(ProjectActions.modifyCompositionAction, ({targetCompositionId, patch}) => {
        const { project } = this.state
        project!.findComposition(targetCompositionId)!.patch(patch)
        this.updateLastModified()
    })

    private handleModifyLayer = listen(ProjectActions.modifyLayerAction, ({targetLayerId, patch}) => {
        const { project } = this.state
        project!.findLayer(targetLayerId)!.patch(patch)
        this.updateLastModified()
    })

    private handleModifyClip = listen(ProjectActions.modifyClipAction, ({targetClipId, patch}) => {
        const { project } = this.state
        project!.findClip(targetClipId)!.patch(patch)
        this.updateLastModified()
    })

    private handleModifyEffect = listen(ProjectActions.modifyEffectAction, ({parentClipId, targetEffectId, patch}) => {
        const { project } = this.state
        project!.findClip(parentClipId)!.findEffect(targetEffectId)!.patch(patch)
        this.updateLastModified()
    })

    private handleModifyClipExpression = listen(ProjectActions.modifyClipExpressionAction, ({ targetClipId, targetParamName, expression }) => {
        const { project } = this.state
        project!.findClip(targetClipId)!.setExpression(targetParamName, expression)
        this.updateLastModified()
    })

    private handleModifyEffectExpression = listen(ProjectActions.modifyEffectExpressionAction, ({ targetClipId, targetEffectId, paramName, expression }) => {
        const { project } = this.state
        project!.findClip(targetClipId)!.findEffect(targetEffectId)!.setExpression(paramName, expression)
        this.updateLastModified()
    })

    private handleModifyKeyframe = listen(ProjectActions.modifyKeyframeAction, ({parentClipId, targetKeyframeId, patch}) => {
        const { project } = this.state
        project!.findClip(parentClipId)!.findKeyframe(targetKeyframeId)!.patch(patch)
        this.updateLastModified()
    })

    private handleModifyEffectKeyframe = listen(ProjectActions.modifyEffectKeyframeAction, ({ targetClipId, effectId, targetKeyframeId, patch }) => {
        const { project } = this.state
        project!.findClip(targetClipId)!.findEffect(effectId)!.findKeyframe(targetKeyframeId)!.patch(patch)
        this.updateLastModified()
    })

    private handleMoveLayerOrder = listen(ProjectActions.moveLayerOrderAction, ({ parentCompositionId, targetLayerId, newIndex }) => {
        const { project } = this.state
        project!.findComposition(parentCompositionId)!.moveLayerIndex(targetLayerId, newIndex)
        this.updateLastModified()
    })

    private handleRemoveComposition = listen(ProjectActions.removeCompositionAction, ({targetCompositionId}) => {
        const { project } = this.state
        project!.removeComposition(targetCompositionId)
        this.updateLastModified()
    })

    private handleRemoveLayer = listen(ProjectActions.removeLayerAction, ({targetLayerId}) => {
        const { project } = this.state
        project!.findLayerOwnerComposition(targetLayerId)!.removeLayer(targetLayerId)
        this.updateLastModified()
    })

    private handleRemoveClip = listen(ProjectActions.removeClipAction, ({targetClipId}) => {
        const { project } = this.state
        project!.findClipOwnerLayer(targetClipId)!.removeClip(targetClipId)
        this.updateLastModified()
    })

    private handleRemoveAsset = listen(ProjectActions.removeAssetAction, ({targetAssetId}) => {
        const { project } = this.state
        project!.removeAsset(targetAssetId)
        this.updateLastModified()
    })

    private handleRemoveKeyframe = listen(ProjectActions.removeKeyframeAction, ({parentClipId, paramName, targetKeyframeId}) => {
        const { project } = this.state
        project!.findClip(parentClipId)!.removeKeyframe(paramName, targetKeyframeId)
        this.updateLastModified()
    })

    private handleRemoveEffectKeyframe = listen(ProjectActions.removeEffectKeyframeAction, ({ clipId, effectId, paramName, targetKeyframeId }) => {
        const { project } = this.state
        project!.findClip(clipId)!.findEffect(effectId)!.removeKeyframe(paramName, targetKeyframeId)
        this.updateLastModified()
    })

    private handleRemoveEffectFromClip = listen(ProjectActions.removeEffectFromClipAction, ({ holderClipId, targetEffectId }) => {
        const { project } = this.state
        project!.findClip(holderClipId)!.removeEffect(targetEffectId)
        this.updateLastModified()
    })

    public getState() {
        return this.state
    }

    public getProject() {
        return this.state.project
    }

    private updateLastModified = () => {
        // Projectの変更は検知できないし、構造が大きくなる可能性があるので今のところImmutableにもしたくない
        this.updateWith(d => d.lastChangeTime = Date.now())
    }
}
