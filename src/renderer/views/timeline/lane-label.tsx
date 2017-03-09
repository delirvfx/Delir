import * as React from 'react'
import {PropTypes} from 'react'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/connectToStores'

import RendererService from '../../services/renderer'
import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'
import ProjectModifyActions from '../../actions/project-modify-actions'

import LabelInput from '../components/label-input'
import {ContextMenu, MenuItem} from '../components/context-menu'
import LaneLabelProps from './lane-label-props'

interface LaneLabelProps {
    editor: EditorState
    layer: Delir.Project.Layer

    /**
     * Layer select handler
     */
    onSelect: () => any

    /** Layer remove handler */
    onRemove: () => any
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState(),
}))
export default class LaneLabel extends React.Component<LaneLabelProps, null>
{
    static propTypes = {
        editor: PropTypes.object.isRequired,
        layer: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
    }

    layerNameChanged = (value: string) =>
    {
        const {layer} = this.props
        ProjectModifyActions.modifyLayer(layer.id!, {name: value})
    }

    render()
    {
        const {layer, editor: {activeLayer}, onSelect, onRemove} = this.props
        const clips = Array.from(layer.clips.values())
        const propTypes = activeLayer ? RendererService.pluginRegistry!.getParametersById(activeLayer.renderer) : []
        const hasActiveLayer = clips.findIndex(layer => !!(activeLayer && layer.id === activeLayer.id)) !== -1

        return (
            <ul key={layer.id} className={classnames(
                'timeline_lane-label', {
                    '--expand': hasActiveLayer,
                })}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    {/*<MenuItem label='複製' onClick={() => {}} />*/}
                    <MenuItem label='削除' onClick={onRemove.bind(null, layer.id)} />
                    <MenuItem type='separator' />
                </ContextMenu>

                <li className='timeline_lane-label_col --col-name' onClick={onSelect.bind(this, layer.id)}>
                    <LabelInput defaultValue={layer.name} placeholder='Layer name' onChange={this.layerNameChanged} />
                </li>
                <li className='timeline_lane-label_col --col-visibility'>
                    👁
                </li>
                <li className='timeline_lane-label_col --col-lock'>
                    🔓
                </li>

                {/*{hasActiveLayer && <LaneLabelProps onChanged={() => {}} descriptor={propTypes} />}*/}
            </ul>
        )
    }
}
