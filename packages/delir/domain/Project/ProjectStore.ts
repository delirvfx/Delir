import * as Delir from '@ragg/delir-core'
import { ProjectHelper } from '@ragg/delir-core'
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

    // @ts-ignore
    private handleSetActiveProject = listen(EditorActions.setActiveProjectAction, (payload) => {
        this.updateWith(d => d.project = payload.project)
    })

    // @ts-ignore
    private handleClearActiveProject = listen(EditorActions.clearActiveProjectAction, (payload) => {
        this.updateWith(d => d.project = null)
    })

    // @ts-ignore
    private handleCreateComposition = listen(ProjectActions.createCompositionAction, (payload) => {
        const { project } = this.state
        const newLayer = new Delir.Entity.Layer()
        ProjectHelper.addComposition(project!, payload.composition)
        ProjectHelper.addLayer(project!, payload.composition, newLayer)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleCreateLayer = listen(ProjectActions.createLayerAction, (payload) => {
        const { project } = this.state
        ProjectHelper.addLayer(project!, payload.targetCompositionId, payload.layer)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleCreateClip = listen(ProjectActions.createClipAction, (payload) => {
        const { project } = this.state
        ProjectHelper.addClip(project!, payload.targetLayerId, payload.newClip)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddClip = listen(ProjectActions.addClipAction, (payload) => {
        const { project } = this.state
        const { targetLayer, newClip } = payload
        ProjectHelper.addClip(project!, targetLayer, newClip)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddLayer = listen(ProjectActions.addLayerAction, (payload) => {
        const { project } = this.state
        ProjectHelper.addLayer(project!, payload.targetComposition, payload.layer)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddLayerWithAsset = listen(ProjectActions.addLayerWithAssetAction, (payload) => {
        const { project } = this.state
        const { targetComposition, clip, asset: registeredAsset } = payload
        const propName = Delir.Engine.Renderers.getInfo(clip.renderer).assetAssignMap[registeredAsset.fileType]

        if (propName == null) return
        ProjectHelper.addKeyframe(project!, clip, propName, Object.assign(new Delir.Entity.Keyframe(), {
            frameOnClip: 0,
            value: { assetId: registeredAsset.id },
        }))

        const layer = new Delir.Entity.Layer()
        ProjectHelper.addLayer(project!, targetComposition, layer)
        ProjectHelper.addClip(project!, layer, clip)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddAsset = listen(ProjectActions.addAssetAction, (payload) => {
        const { project } = this.state
        ProjectHelper.addAsset(project!, payload.asset)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddKeyframe = listen(ProjectActions.addKeyframeAction, (payload) => {
        const { project } = this.state
        const { targetClip, paramName, keyframe } = payload
        ProjectHelper.addKeyframe(project!, targetClip, paramName, keyframe)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddEffectIntoClipPayload = listen(ProjectActions.addEffectIntoClipAction, (payload) => {
        const { project } = this.state
        const { clipId, effect } = payload
        ProjectHelper.addEffect(project!, clipId, effect)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleAddEffectKeyframe = listen(ProjectActions.addEffectKeyframeAction, (payload) => {
        const { project } = this.state
        const { targetClipId, targetEffectId, paramName, keyframe } = payload
        ProjectHelper.addEffectKeyframe(project!, targetClipId, targetEffectId, paramName, keyframe)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleMoveClipToLayer = listen(ProjectActions.moveClipToLayerAction, (payload) => {
        const { project } = this.state
        const targetClip = ProjectHelper.findClipById(project!, payload.clipId)
        const sourceLayer = ProjectHelper.findParentLayerByClipId(project!, payload.clipId)
        const destLayer = ProjectHelper.findLayerById(project!, payload.destLayerId)

        if (targetClip && sourceLayer && destLayer) {
            ProjectHelper.deleteClip(project!, targetClip)
            ProjectHelper.addClip(project!, destLayer, targetClip)
            this.updateLastModified()
        }
    })

    // @ts-ignore
    private handleModifyComposition = listen(ProjectActions.modifyCompositionAction, (payload) => {
        const { project } = this.state
        ProjectHelper.modifyComposition(project!, payload.targetCompositionId, payload.patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyLayer = listen(ProjectActions.modifyLayerAction, (payload) => {
        const { project } = this.state
        ProjectHelper.modifyLayer(project!, payload.targetLayerId, payload.patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyClip = listen(ProjectActions.modifyClipAction, (payload) => {
        const { project } = this.state
        ProjectHelper.modifyClip(project!, payload.targetClipId, payload.patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyClipExpression = listen(ProjectActions.modifyClipExpressionAction, (payload) => {
        const { project } = this.state
        const { targetClipId, targetProperty, expr } = payload
        ProjectHelper.modifyClipExpression(project!, targetClipId, targetProperty, new Delir.Values.Expression(expr.language, expr.code))
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyEffectExpression = listen(ProjectActions.modifyEffectExpressionAction, (payload) => {
        const { project } = this.state
        const { targetClipId, targetEffectId, targetProperty, expr } = payload
        ProjectHelper.modifyEffectExpression(project!, targetClipId, targetEffectId, targetProperty, new Delir.Values.Expression(expr.language, expr.code))
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyKeyframe = listen(ProjectActions.modifyKeyframeAction, (payload) => {
        const { project } = this.state
        ProjectHelper.modifyKeyframe(project!, payload.targetKeyframeId, payload.patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleModifyEffectKeyframe = listen(ProjectActions.modifyEffectKeyframeAction, (payload) => {
        const { project } = this.state
        const { targetClipId, effectId, targetKeyframeId, patch } = payload
        ProjectHelper.modifyEffectKeyframe(project!, targetClipId, effectId, targetKeyframeId, patch)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleMoveLayerOrder = listen(ProjectActions.moveLayerOrderAction, (payload) => {
        const { project } = this.state
        const { parentCompositionId, targetLayerId, newIndex } = payload
        ProjectHelper.moveLayerOrder(project!, parentCompositionId, targetLayerId, newIndex)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveComposition = listen(ProjectActions.removeCompositionAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteComposition(project!, payload.targetCompositionId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveLayer = listen(ProjectActions.removeLayerAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteLayer(project!, payload.targetLayerId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveClip = listen(ProjectActions.removeClipAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteClip(project!, payload.targetClipId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveAsset = listen(ProjectActions.removeAssetAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteAsset(project!, payload.targetAssetId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveKeyframe = listen(ProjectActions.removeKeyframeAction, (payload) => {
        const { project } = this.state
        ProjectHelper.deleteKeyframe(project!, payload.targetKeyframeId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveEffectKeyframe = listen(ProjectActions.removeEffectKeyframeAction, (payload) => {
        const { project } = this.state
        const { clipId, effectId, targetKeyframeId } = payload
        ProjectHelper.deleteEffectKeyframe(project!, clipId, effectId, targetKeyframeId)
        this.updateLastModified()
    })

    // @ts-ignore
    private handleRemoveEffectFromClip = listen(ProjectActions.removeEffectFromClipAction, (payload) => {
        const { project } = this.state
        const { holderClipId, targetEffectId } = payload
        ProjectHelper.deleteEffectFromClip(project!, holderClipId, targetEffectId)
        this.updateLastModified()
    })

    public getState() {
        return this.state
    }

    private updateLastModified = () => {
        // Projectの変更は検知できないし、構造が大きくなる可能性があるので今のところImmutableにもしたくない
        this.updateWith(d => d.lastChangeTime = Date.now())
    }
}
