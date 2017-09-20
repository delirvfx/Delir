import * as _ from 'lodash'
import {ReduceStore} from 'flux/utils'
import * as uuid from 'uuid'

import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../utils/Flux/Dispatcher'
import Record from '../utils/Record'
import {KnownPayload} from '../actions/PayloadTypes'
import {DispatchTypes as AppActionsDispatchTypes} from '../actions/App'
import {DispatchTypes as ProjectModDispatchTypes} from '../actions/ProjectMod'

type StateRecord = Record<ProjectStoreState>

export interface ProjectStoreState {
    project: Delir.Project.Project|null,
    lastChangeTime: number,
}

class ProjectStore extends ReduceStore<StateRecord, KnownPayload>
{
    getInitialState(): StateRecord
    {
        return new Record({
            project: null,
            lastChangeTime: 0,
        })
    }

    areEqual(a: StateRecord, b: StateRecord): boolean
    {
        const equal = a.equals(b)
        __DEV__ && !equal && console.log('📷 Project updated')
        return equal
    }

    reduce(state: StateRecord, payload: KnownPayload)
    {
        const project: Delir.Project.Project = state.get('project')!
        if (payload.type !== AppActionsDispatchTypes.SetActiveProject && project == null) return state

        switch (payload.type) {
            case AppActionsDispatchTypes.SetActiveProject:
                return state.set('project', payload.entity.project)

            case AppActionsDispatchTypes.ClearActiveProject:
                return state.set('project', null)

            case ProjectModDispatchTypes.CreateComposition:
                const newLayer = new Delir.Project.Layer()
                ProjectHelper.addComposition(project!, payload.entity.composition)
                ProjectHelper.addLayer(project!, payload.entity.composition, newLayer)
                break

            case ProjectModDispatchTypes.CreateLayer:
                ProjectHelper.addLayer(project!, payload.entity.targetCompositionId, payload.entity.layer)
                break

            case ProjectModDispatchTypes.CreateClip:
                ProjectHelper.addClip(project!, payload.entity.targetLayerId, payload.entity.newClip)
                break

            case ProjectModDispatchTypes.AddClip:
                const {targetLayer, newClip} = payload.entity
                ProjectHelper.addClip(project, targetLayer, newClip)
                break

            case ProjectModDispatchTypes.AddLayer:
                ProjectHelper.addLayer(project!, payload.entity.targetComposition, payload.entity.layer)
                break

            case ProjectModDispatchTypes.AddLayerWithAsset:
                (() => {
                    const {targetComposition, clip, asset: registeredAsset} = payload.entity
                    const propName = Delir.Engine.Renderers.getInfo(clip.renderer).assetAssignMap[registeredAsset.fileType]

                    if (propName == null) return
                    ProjectHelper.addKeyframe(project, clip, propName, Object.assign(new Delir.Project.Keyframe(), {
                        frameOnClip: 0,
                        value: {assetId: registeredAsset.id},
                    }))

                    const layer = new Delir.Project.Layer
                    ProjectHelper.addLayer(project, targetComposition, layer)
                    ProjectHelper.addClip(project, layer, clip)
                })()
                break

            case ProjectModDispatchTypes.AddAsset:
                ProjectHelper.addAsset(project!, payload.entity.asset)
                break

            case ProjectModDispatchTypes.AddKeyframe: {
                const {targetClip, propName, keyframe} = payload.entity
                ProjectHelper.addKeyframe(project!, targetClip, propName, keyframe)
                break
            }

            case ProjectModDispatchTypes.AddEffectIntoClipPayload: {
                const { clipId, effect } = payload.entity
                ProjectHelper.addEffect(project!, clipId, effect)
                break
            }

            case ProjectModDispatchTypes.AddEffectKeyframe: {
                const { targetClipId, targetEffectId, propName, keyframe } = payload.entity
                ProjectHelper.addEffectKeyframe(project, targetClipId, targetEffectId, propName, keyframe)
                break
            }

            case ProjectModDispatchTypes.MoveClipToLayer: {
                const targetClip = ProjectHelper.findClipById(project!, payload.entity.clipId)
                const sourceLane = ProjectHelper.findParentLayerByClipId(project!, payload.entity.clipId)
                const destLane = ProjectHelper.findLayerById(project!, payload.entity.targetLayerId)

                if (targetClip == null || sourceLane == null || destLane == null) break

                ProjectHelper.deleteClip(project!, targetClip)
                ProjectHelper.addClip(project!, destLane, targetClip)
                break
            }

            case ProjectModDispatchTypes.ModifyComposition:
                ProjectHelper.modifyComposition(project!, payload.entity.targetCompositionId, payload.entity.patch)
                break

            case ProjectModDispatchTypes.ModifyLayer:
                ProjectHelper.modifyLayer(project!, payload.entity.targetLayerId, payload.entity.patch)
                break

            case ProjectModDispatchTypes.ModifyClip:
                ProjectHelper.modifyClip(project!, payload.entity.targetClipId, payload.entity.patch)
                break

            case ProjectModDispatchTypes.ModifyClipExpression: {
                const {targetClipId, targetProperty, expr} = payload.entity
                ProjectHelper.modifyClipExpression(project!, targetClipId, targetProperty, new Delir.Values.Expression(expr.language, expr.code))
                break
            }

            case ProjectModDispatchTypes.ModifyEffectExpression: {
                const {targetClipId, targetEffectId, targetProperty, expr} = payload.entity
                ProjectHelper.modifyEffectExpression(project!, targetClipId, targetEffectId, targetProperty, new Delir.Values.Expression(expr.language, expr.code))
                break
            }

            case ProjectModDispatchTypes.ModifyKeyframe: {
                ProjectHelper.modifyKeyframe(project!, payload.entity.targetKeyframeId, payload.entity.patch)
                break
            }

            case ProjectModDispatchTypes.ModifyEffectKeyframe: {
                const { targetClipId, effectId, targetKeyframeId, patch } = payload.entity
                ProjectHelper.modifyEffectKeyframe(project!, targetClipId, effectId, targetKeyframeId, patch)
                break
            }

            case ProjectModDispatchTypes.RemoveComposition:
                ProjectHelper.deleteComposition(project!, payload.entity.targetCompositionId)
                break

            case ProjectModDispatchTypes.RemoveLayer:
                ProjectHelper.deleteLayer(project!, payload.entity.targetLayerId)
                break

            case ProjectModDispatchTypes.RemoveClip:
                ProjectHelper.deleteClip(project!, payload.entity.targetClipId)
                break

            case ProjectModDispatchTypes.RemoveAsset:
                ProjectHelper.deleteAsset(project!, payload.entity.targetAssetId)
                break

            case ProjectModDispatchTypes.RemoveKeyframe:
                ProjectHelper.deleteKeyframe(project!, payload.entity.targetKeyframeId)
                break

            case ProjectModDispatchTypes.RemoveEffectKeyframe: {
                const { clipId, effectId, targetKeyframeId } = payload.entity
                ProjectHelper.deleteEffectKeyframe(project!, clipId, effectId, targetKeyframeId)
                break
            }

            case ProjectModDispatchTypes.RemoveEffectFromClip: {
                const { holderClipId, targetEffectId } = payload.entity
                ProjectHelper.deleteEffectFromClip(project, holderClipId, targetEffectId)
                break
            }

            default:
                return state
        }

        // Projectの変更は検知できないし、構造が大きくなる可能性があるので今のところImmutableにもしたくない
        return state.set('lastChangeTime', Date.now())
    }
}

const store = new ProjectStore(dispatcher)

if (__DEV__) {
    _.set(window, 'app.store.ProjectModifyStore', store)
}

export default store
