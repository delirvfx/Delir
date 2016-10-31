import React, {PropTypes} from 'react'

import AppStore from '../stores/app-store'
import EditorStateStore from '../stores/editor-state-store'

import Pane from './components/pane'

export default class PreviewView extends React.Component
{
    constructor()
    {
        super()

        this.state = {
            project: EditorStateStore.getState()
        }

        EditorStateStore.addListener(() => {
            console.log('change');
            this.setState({project: EditorStateStore.getState()})
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

    render()
    {
        const {project} = this.state
        // console.log(project.activeComp);

        return (
            <Pane className='view-preview' allowFocus>
                <div className='inner'>
                    <div className='header'>{project.activeComp && project.activeComp.name}</div>
                    <div className='view'>
                        <canvas ref='canvas' className='canvas' width='640' height='360' />
                        <video ref='video' src='../../navcodec.mp4' style={{display:'none'}} controls loop />
                    </div>
                </div>
            </Pane>
        )
    }
}
