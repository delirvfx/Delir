import * as _ from 'lodash'
import {ReduceStore} from 'flux/utils'
import * as uuid from 'uuid'

import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../dispatcher'
import Record from '../utils/Record'
import {KnownPayload} from '../actions/PayloadTypes'
import {DispatchTypes as EditorStateDispatchTypes} from '../actions/editor-state-actions'
import {DispatchTypes as ProjectModifyDispatchTypes} from '../actions/project-modify-actions'

type StateRecord = Record<ProjectModifyState>
export interface ProjectModifyState {
    project: Delir.Project.Project|null,
    lastChangeTime: number,
}

class ProjectModifyStore extends ReduceStore<StateRecord, KnownPayload>
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
        if (payload.type !== EditorStateDispatchTypes.SetActiveProject && project == null) return state

        switch (payload.type) {
            case EditorStateDispatchTypes.SetActiveProject:
                return state.set('project', payload.entity.project)

            case EditorStateDispatchTypes.ClearActiveProject:
                return state.set('project', null)

            case ProjectModifyDispatchTypes.CreateComposition:
                const newLayer = new Delir.Project.Layer()
                ProjectHelper.addComposition(project!, payload.entity.composition)
                ProjectHelper.addLayer(project!, payload.entity.composition, newLayer)
                break

            case ProjectModifyDispatchTypes.CreateLayer:
                ProjectHelper.addLayer(project!, payload.entity.targetCompositionId, payload.entity.layer)
                break

            case ProjectModifyDispatchTypes.CreateClip:
                ProjectHelper.addClip(project!, payload.entity.targetLayerId, payload.entity.newClip)
                break

            case ProjectModifyDispatchTypes.AddClip:
                const {targetLayer, newClip} = payload.entity
                ProjectHelper.addClip(project, targetLayer, newClip)
                break

            case ProjectModifyDispatchTypes.AddLayer:
                ProjectHelper.addLayer(project!, payload.entity.targetComposition, payload.entity.layer)
                break

            case ProjectModifyDispatchTypes.AddLayerWithAsset:
                (() => {
                    const {targetComposition, clip, asset: registeredAsset} = payload.entity
                    const propName = Delir.Renderer.Renderers.getInfo(clip.renderer).assetAssignMap[registeredAsset.fileType]

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

            case ProjectModifyDispatchTypes.AddAsset:
                ProjectHelper.addAsset(project!, payload.entity.asset)
                break

            case ProjectModifyDispatchTypes.AddKeyframe: {
                const {targetClip, propName, keyframe} = payload.entity
                ProjectHelper.addKeyframe(project!, targetClip, propName, keyframe)
            }

            case ProjectModifyDispatchTypes.MoveClipToLayer: {
                const targetClip = ProjectHelper.findClipById(project!, payload.entity.clipId)
                const sourceLane = ProjectHelper.findParentLayerByClipId(project!, payload.entity.clipId)
                const destLane = ProjectHelper.findLayerById(project!, payload.entity.targetLayerId)

                if (targetClip == null || sourceLane == null || destLane == null) break

                ProjectHelper.deleteClip(project!, targetClip)
                ProjectHelper.addClip(project!, destLane, targetClip)
                break
            }

            case ProjectModifyDispatchTypes.ModifyComposition:
                ProjectHelper.modifyComposition(project!, payload.entity.targetCompositionId, payload.entity.patch)
                break

            case ProjectModifyDispatchTypes.ModifyLayer:
                ProjectHelper.modifyLayer(project!, payload.entity.targetLayerId, payload.entity.patch)
                break

            case ProjectModifyDispatchTypes.ModifyClip:
                ProjectHelper.modifyClip(project!, payload.entity.targetClipId, payload.entity.patch)
                break

            case ProjectModifyDispatchTypes.ModifyClipExpression: {
                const {targetClipId, targetProperty, expr} = payload.entity
                ProjectHelper.modifyClipExpression(project!, targetClipId, targetProperty, new Delir.Values.Expression(expr.language, expr.code))
                break
            }

            case ProjectModifyDispatchTypes.ModifyKeyframe:
                ProjectHelper.modifyKeyframe(project!, payload.entity.targetKeyframeId, payload.entity.patch)
                break

            case ProjectModifyDispatchTypes.RemoveComposition:
                ProjectHelper.deleteComposition(project!, payload.entity.targetCompositionId)
                break

            case ProjectModifyDispatchTypes.RemoveLayer:
                ProjectHelper.deleteLayer(project!, payload.entity.targetClipId)
                break

            case ProjectModifyDispatchTypes.RemoveClip:
                ProjectHelper.deleteClip(project!, payload.entity.targetClipId)
                break

            case ProjectModifyDispatchTypes.RemoveAsset:
                ProjectHelper.deleteAsset(project!, payload.entity.targetAssetId)
                break

            case ProjectModifyDispatchTypes.RemoveKeyframe:
                ProjectHelper.deleteKeyframe(project!, payload.entity.targetKeyframeId)
                break

            default:
                return state
        }

        // Projectの変更は検知できないし、構造が大きくなる可能性があるので今のところImmutableにもしたくない
        return state.set('lastChangeTime', Date.now())
    }
}

const store = new ProjectModifyStore(dispatcher)
_.set(window, 'app.store.ProjectModifyStore', store)
export default store
