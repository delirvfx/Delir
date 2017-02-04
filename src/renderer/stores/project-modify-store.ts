import * as _ from 'lodash'
import {ReduceStore} from 'flux/utils'
import * as Immutable from 'immutable'

import * as Delir from 'delir-core'
import {ProjectHelper} from 'delir-core'

import dispatcher from '../dispatcher'
import {KnownPayload} from '../actions/PayloadTypes'
import {DispatchTypes as EditorStateDispatchTypes} from '../actions/editor-state-actions'
import {DispatchTypes as ProjectModifyDispatchTypes} from '../actions/project-modify-actions'

type StateRecord = Immutable.Map<keyof StateType, StateType[keyof StateType]>
interface StateType {
    project: Delir.Project.Project|null,
}

class ProjectModifyStore extends ReduceStore<StateRecord, KnownPayload>
{
    getInitialState(): StateRecord
    {
        return Immutable.Map<keyof StateType, StateType[keyof StateType]>({
            project: null,
        })
    }

    reduce(state: StateRecord, payload: KnownPayload)
    {
        const project: Delir.Project.Project|null = state.get('project')
        if (payload.type !== EditorStateDispatchTypes.SetActiveProject && project == null) return state

        switch (payload.type) {
            case EditorStateDispatchTypes.SetActiveProject: 
                return state.set('project', payload.entity.project)
                
            case ProjectModifyDispatchTypes.CreateComposition:
                ProjectHelper.addComposition(project!, payload.entity.composition)
                break
            
            case ProjectModifyDispatchTypes.CreateTimelane:
                ProjectHelper.addTimelane(project!, payload.entity.targetCompositionId, payload.entity.timelane)
                break
            
            case ProjectModifyDispatchTypes.CreateLayer:
                ProjectHelper.addLayer(project!, payload.entity.targetTimelaneId, payload.entity.props as any)
                break

            case ProjectModifyDispatchTypes.AddTimelane:
                ProjectHelper.addTimelane(project!, payload.entity.targetComposition, payload.entity.timelane)
                break
                
            case ProjectModifyDispatchTypes.AddAsset:
                ProjectHelper.addAsset(project!, payload.entity.asset)
                break

            case ProjectModifyDispatchTypes.MoveLayerToTimelane:
                const targetLayer = ProjectHelper.findLayerById(project!, payload.entity.layerId)
                const sourceLane = ProjectHelper.findParentTimelaneByLayerId(project!, payload.entity.layerId)
                const destLane = ProjectHelper.findTimelaneById(project!, payload.entity.targetTimelaneId)

                if (targetLayer == null || sourceLane == null || destLane == null) break

                sourceLane.layers.delete(targetLayer)
                destLane.layers.add(targetLayer)
                break

            case ProjectModifyDispatchTypes.ModifyComposition:
                ProjectHelper.modifyLayer(project!, payload.entity.targetCompositionId, payload.entity.patch)
                break

            case ProjectModifyDispatchTypes.ModifyLayer:
                ProjectHelper.modifyLayer(project!, payload.entity.targetLayerId, payload.entity.patch)
                break

            case ProjectModifyDispatchTypes.RemoveTimelane:
                ProjectHelper.deleteTimelane(project!, payload.entity.targetLayerId)
                break

            case ProjectModifyDispatchTypes.RemoveLayer:
                ProjectHelper.deleteLayer(project!, payload.entity.targetLayerId)
                break
        }

        return state
    }
}

export default new ProjectModifyStore(dispatcher)
