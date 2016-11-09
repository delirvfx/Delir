import React, {PropTypes} from 'react'

import AppStore from '../stores/app-store'
import EditorStateStore from '../stores/editor-state-store'
import ProjectModifyStore from '../stores/project-modify-store'

import Pane from './components/pane'

export default class PreviewView extends React.Component
{
    constructor()
    {
        super()

        this.state = {
            project: EditorStateStore.getState(),
            scale: 1,
        }

        EditorStateStore.addListener(() => {
            this.setState({project: EditorStateStore.getState()})
        })

        ProjectModifyStore.addListener(() => {
            this.forceUpdate()
        })
    }

    componentDidMount()
    {
        // const ctx = this.refs.canvas.getContext('2d')
        //
        // const cRand = () => ((Math.random() * 256) | 0).toString(16)
        // const render = () => {
        //     ctx.fillStyle = '#000'
        //     ctx.fillRect(0, 0, 640, 360)
        //     ctx.drawImage(this.refs.video, 0, 0)
        //
        //     requestAnimationFrame(render)
        // }
        //
        // requestAnimationFrame(render)
    }

    onWheel = e => {
        if (!e.altKey) return

        this.setState({
            scale: Math.max(.1, Math.min(this.state.scale + (-e.deltaY / 20), 3))
        })
    }

    render()
    {
        const {project} = this.state
        // console.log(project.activeComp);

        return (
            <Pane className='view-preview' allowFocus>
                <div className='inner'>
                    <div className='header'>{project.activeComp && project.activeComp.name}</div>
                    <div className='view' onWheel={this.onWheel}>
                        <canvas ref='canvas' className='canvas' width='640' height='360' style={{transform:`scale(${this.state.scale})`}}/>
                        <video ref='video' src='../../navcodec.mp4' style={{display:'none'}} controls loop />
                    </div>
                    <div className='footer'>
                        <label>Scale</label>
                        <select>
                            <option value="50">50%</option>
                            <option value="100">100%</option>
                            <option value="120">120%</option>
                        </select>
                    </div>
                </div>
            </Pane>
        )
    }
}
