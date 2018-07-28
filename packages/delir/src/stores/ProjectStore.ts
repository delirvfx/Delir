import * as Delir from '@ragg/delir-core'
import { ProjectHelper } from '@ragg/delir-core'
import { listen, Store } from '@ragg/fleur'

import { ProjectModActions } from '../actions/ProjectMod'

export interface ProjectStoreState {
    project: Delir.Project.Project | null,
    lastChangeTime: number,
}

export default class ProjectStore extends Store<ProjectStoreState>
{
    protected state = {
        project: null,
        lastChangeTime: 0,
    }

    // @ts-ignore
    private handleSetActiveProject = listen(ProjectModActions.setActiveProjectAction, (payload) => {
        this.updateWith(d => d.project = payload.project)
    })

    // @ts-ignore
    private handleClearActiveProject = listen(ProjectModActions.clearActiveProjectAction, (payload) => {
        this.updateWith(d => d.project = null)
    })

    // @ts-ignore
    private handleCreateComposition = listen(ProjectModActions.createCompositionAction, (payload) => {
        const { project } = this.state
        const newLayer = new Delir.Project.Layer()
        ProjectHelper.addComposition(project!, payload.composition)
        ProjectHelper.addLayer(project!, payload.composition, newLayer)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleCreateLayer = listen(ProjectModActions.createLayerAction, (payload) => {
        const { project } = this.state
        ProjectHelper.addLayer(project!, payload.targetCompositionId, payload.layer)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleCreateClip = listen(ProjectModActions.createClipAction, (payload) => {
        const { project } = this.state
        ProjectHelper.addClip(project!, payload.targetLayerId, payload.newClip)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddClip = listen(ProjectModActions.addClipAction, (payload) => {
        const { project } = this.state
        const { targetLayer, newClip } = payload
        ProjectHelper.addClip(project, targetLayer, newClip)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddLayer = listen(ProjectModActions.addLayerAction, (payload) => {
        const { project } = this.state
        ProjectHelper.addLayer(project!, payload.targetComposition, payload.layer)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddLayerWithAsset = listen(ProjectModActions.addLayerWithAssetAction, (payload) => {
        const { project } = this.state
        const { targetComposition, clip, asset: registeredAsset } = payload
        const propName = Delir.Engine.Renderers.getInfo(clip.renderer).assetAssignMap[registeredAsset.fileType]

        if (propName == null) return
        ProjectHelper.addKeyframe(project, clip, propName, Object.assign(new Delir.Project.Keyframe(), {
            frameOnClip: 0,
            value: { assetId: registeredAsset.id },
        }))

        const layer = new Delir.Project.Layer()
        ProjectHelper.addLayer(project, targetComposition, layer)
        ProjectHelper.addClip(project, layer, clip)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddAsset = listen(ProjectModActions.addAssetAction, (payload) => {
        const { project } = this.state
        ProjectHelper.addAsset(project!, payload.asset)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddKeyframe = listen(ProjectModActions.addKeyframeAction, (payload) => {
        const { project } = this.state
        const { targetClip, propName, keyframe } = payload
        ProjectHelper.addKeyframe(project!, targetClip, propName, keyframe)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddEffectIntoClipPayload = listen(ProjectModActions.addEffectIntoClipPayloadAction, (payload) => {
        const { project } = this.state
        const { clipId, effect } = payload
        ProjectHelper.addEffect(project!, clipId, effect)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddEffectKeyframe = listen(ProjectModActions.addEffectKeyframeAction, (payload) => {
        const { project } = this.state
        const { targetClipId, targetEffectId, propName, keyframe } = payload
        ProjectHelper.addEffectKeyframe(project, targetClipId, targetEffectId, propName, keyframe)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleMoveClipToLayer = listen(ProjectModActions.moveClipToLayerAction, (payload) => {
        const { project } = this.state
        const targetClip = ProjectHelper.findClipById(project!, payload.clipId)
        const sourceLane = ProjectHelper.findParentLayerByClipId(project!, payload.clipId)
        const destLane = ProjectHelper.findLayerById(project!, payload.targetLayerId)

        if (targetClip == null || sourceLane == null || destLane == null) {
            ProjectHelper.deleteClip(project!, targetClip)
            ProjectHelper.addClip(project!, destLane, targetClip)
            this.updateLastModified()
        }
    })

    // @ts-ignore
    private handleModifyComposition = listen(ProjectModActions.modifyCompositionAction, (payload) => {
        const { project } = this.state
        ProjectHelper.modifyComposition(project!, payload.targetCompositionId, payload.patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyLayer = listen(ProjectModActions.modifyLayerAction, (payload) => {
        const { project } = this.state
        ProjectHelper.modifyLayer(project!, payload.targetLayerId, payload.patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyClip = listen(ProjectModActions.modifyClipAction, (payload) => {
        const { project } = this.state
        ProjectHelper.modifyClip(project!, payload.targetClipId, payload.patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyClipExpression = listen(ProjectModActions.modifyClipExpressionAction, (payload) => {
        const { project } = this.state
        const { targetClipId, targetProperty, expr } = payload
        ProjectHelper.modifyClipExpression(project!, targetClipId, targetProperty, new Delir.Values.Expression(expr.language, expr.code))
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyEffectExpression = listen(ProjectModActions.modifyEffectExpressionAction, (payload) => {
        const { project } = this.state
        const { targetClipId, targetEffectId, targetProperty, expr } = payload
        ProjectHelper.modifyEffectExpression(project!, targetClipId, targetEffectId, targetProperty, new Delir.Values.Expression(expr.language, expr.code))
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyKeyframe = listen(ProjectModActions.modifyKeyframeAction, (payload) => {
        const { project } = this.state
        ProjectHelper.modifyKeyframe(project!, payload.targetKeyframeId, payload.patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyEffectKeyframe = listen(ProjectModActions.modifyEffectKeyframeAction, (payload) => {
        const { project } = this.state
        const { targetClipId, effectId, targetKeyframeId, patch } = payload
        ProjectHelper.modifyEffectKeyframe(project!, targetClipId, effectId, targetKeyframeId, patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleMoveLayerOrder = listen(ProjectModActions.moveLayerOrderAction, (payload) => {
        const { project } = this.state
        const { parentCompositionId, targetLayerId, newIndex } = payload
        ProjectHelper.moveLayerOrder(project, parentCompositionId, targetLayerId, newIndex)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveComposition = listen(ProjectModActions.removeCompositionAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteComposition(project!, payload.targetCompositionId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveLayer = listen(ProjectModActions.removeLayerAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteLayer(project!, payload.targetLayerId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveClip = listen(ProjectModActions.removeClipAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteClip(project!, payload.targetClipId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveAsset = listen(ProjectModActions.removeAssetAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteAsset(project!, payload.targetAssetId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveKeyframe = listen(ProjectModActions.removeKeyframeAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteKeyframe(project!, payload.targetKeyframeId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveEffectKeyframe = listen(ProjectModActions.removeEffectKeyframeAction, (payload) => {
        const { project } = this.state
        const { clipId, effectId, targetKeyframeId } = payload
        ProjectHelper.deleteEffectKeyframe(project!, clipId, effectId, targetKeyframeId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveEffectFromClip = listen(ProjectModActions.removeEffectFromClipAction, (payload) => {
        const { project } = this.state
        const { holderClipId, targetEffectId } = payload
        ProjectHelper.deleteEffectFromClip(project, holderClipId, targetEffectId)
        this.updateLastModified()
    })

    private updateLastModified = () => {
        // Projectの変更は検知できないし、構造が大きくなる可能性があるので今のところImmutableにもしたくない
        this.updateWith(d => d.lastChangeTime = Date.now())
    }
}
