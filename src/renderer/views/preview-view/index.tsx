import * as React from 'react'
import {PropTypes} from 'react'
import * as Delir from 'delir-core'

import connectToStores from '../../utils/connectToStores'

import EditorStateStore from '../../stores/editor-state-store'
import ProjectModifyStore from '../../stores/project-modify-store'

import Pane from '../components/pane'

interface PreviewViewProps {
    activeComp: Delir.Project.Composition
}

interface PreviewViewState {
    scale: number
}

@connectToStores([EditorStateStore], () => ({
    activeComp: EditorStateStore.getState().get('activeComp')
}))
export default class PreviewView extends React.Component<PreviewViewProps, PreviewViewState>
{
    constructor()
    {
        super()

        this.state = {
            scale: 1,
        }
    }

    selectScale = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
        this.setState({
            scale: parseInt(e.target.value, 10) / 100
        })
    }

    onWheel = e => {
        if (!e.altKey) return

        this.setState({
            scale: Math.max(.1, Math.min(this.state.scale + (-e.deltaY / 20), 3))
        })
    }

    render()
    {
        const {activeComp} = this.props
        const currentScale = Math.round(this.state.scale * 100)

        return (
            <Pane className='view-preview' allowFocus>
                <div className='inner'>
                    <div className='header'>{activeComp && activeComp.name}</div>
                    <div className='view' onWheel={this.onWheel}>
                        <canvas ref='canvas' className='canvas' width='640' height='360' style={{transform:`scale(${this.state.scale})`}}/>
                        <video ref='video' src='../../navcodec.mp4' style={{display:'none'}} controls loop />
                    </div>
                    <div className='footer'>
                        <label>
                            Scale: {currentScale}%
                            <select onChange={this.selectScale} style={{visibility: 'hidden'}}>
                                <option value="50">50%</option>
                                <option value="100">100%</option>
                                <option value="120">120%</option>
                            </select>
                        </label>
                    </div>
                </div>
            </Pane>
        )
    }
}
