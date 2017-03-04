import * as React from 'react'
import {PropTypes} from 'React'
import * as classnames from 'classnames'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/connectToStores'

import RendererService from '../../services/renderer'
import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'

import LabelInput from '../components/label-input'
import {ContextMenu, MenuItem} from '../electron/context-menu'
import LaneLabelProps from './lane-label-props'

interface LaneLabelProps {
    editor: EditorState
    timelane: Delir.Project.Timelane
    onSelect: () => any
    onRemove: () => any
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState(),
}))
export default class LaneLabel extends React.Component<LaneLabelProps>
{
    static propTypes = {
        editor: PropTypes.object.isRequired,
        timelane: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
    }

    render()
    {
        const {timelane, editor: {activeLayer}, onSelect, onRemove} = this.props
        const clips = Array.from(timelane.clips.values())
        const propTypes = activeLayer ? RendererService.pluginRegistry!.getParametersById(activeLayer.renderer) : []
        const hasActiveLayer = clips.findIndex(layer => !!(activeLayer && layer.id === activeLayer.id)) !== -1

        return (
            <ul key={timelane.id} className={classnames(
                'timeline_lane-label', {
                    '--expand': hasActiveLayer,
                })}
            >
                <ContextMenu>
                    <MenuItem type='separator' />
                    {/*<MenuItem label='複製' onClick={() => {}} />*/}
                    <MenuItem label='削除' onClick={onRemove.bind(null, timelane.id)} />
                    <MenuItem type='separator' />
                </ContextMenu>

                <li className='timeline_lane-label_col --col-name' onClick={onSelect.bind(this, timelane.id)}>
                    <LabelInput defaultValue={timelane.name} placeholder='TimeLane' />
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
