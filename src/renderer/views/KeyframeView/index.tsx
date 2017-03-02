import * as _ from 'lodash'
import * as React from 'react'
import {PropTypes} from 'react'
import * as Delir from 'delir-core'
import parseColor from 'parse-color'
import connectToStores from '../../utils/connectToStores'

import Workspace from '../components/workspace'
import Pane from '../components/pane'
import SelectList from '../components/select-list'
import DelirValueInput from './_DelirValueInput'

import ProjectModifyActions from '../../actions/project-modify-actions'

import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'
import {default as ProjectModifyStore, ProjectModifyState} from '../../stores/project-modify-store'
import RendererService from '../../services/renderer'

import s from './style.styl'

interface KeyframeViewProps {
    activeLayer: Delir.Project.Layer|null
    editor: EditorState
    project: ProjectModifyState
}

@connectToStores([EditorStateStore], () => ({
    // editor: EditorStateStore.getState(),
    project: ProjectModifyStore.getState()
}))
export default class KeyframeView extends React.Component<KeyframeViewProps, any> {
    static propTypes = {
        activeLayer: PropTypes.instanceOf(Delir.Project.Layer)
    }

    castValue = (desc: Delir.AnyParameterTypeDescriptor, value: string|number) =>
    {

        return value
    }

    selectProperty = ({currentTarget}: React.MouseEvent<HTMLDivElement>) =>
    {
        const propName: string = currentTarget.dataset.propName!
    }

    valueChanged = (desc: Delir.AnyParameterTypeDescriptor, value: any) =>
    {
        const {activeLayer} = this.props
        const newOptions = _.set(
            _.cloneDeep(activeLayer!.rendererOptions),
            desc.propName,
            value
        )

        ProjectModifyActions.modifyLayer(activeLayer!.id!, {
            rendererOptions: newOptions
        })
    }

    render()
    {
        const {activeLayer, project: {project}} = this.props
        const descriptors = activeLayer
            ? RendererService.pluginRegistry!.getParametersById(activeLayer.renderer) || []
            : []

        return (
            <Workspace direction='horizontal' className={s.keyframeView}>
                <Pane className={s.propList}>
                    <SelectList>
                        {descriptors.map(desc => (
                            <div
                                key={activeLayer!.id + desc.propName}
                                className={s.propItem}
                                data-prop-name={desc.propName}
                                onClick={this.selectProperty}
                            >
                                <span className={s.propItemName}>{desc.label}</span>
                                <div className={s.propItemInput}>
                                    <DelirValueInput assets={project ? project.assets : null} descriptor={desc} value={activeLayer!.rendererOptions[desc.propName]} onChange={this.valueChanged} />
                                </div>
                            </div>
                        ))}
                    </SelectList>
                </Pane>
                <Pane>
                    <div className={s.keyframes}>
                    </div>
                </Pane>
            </Workspace>
        )
    }
}