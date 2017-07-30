import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as Delir from 'delir-core'

import connectToStores from '../../utils/Flux/connectToStores'

import Pane from '../components/pane'
import DropDown from '../components/dropdown'

import EditorStateStore from '../../stores/EditorStateStore'
import ProjectStore from '../../stores/ProjectStore'
import RendererService from '../../services/renderer'

import t from './PreviewView.i18n'
import * as s from './style.styl'

interface PreviewViewProps {
    activeComp: Delir.Project.Composition
}

interface PreviewViewState {
    scale: number
    scaleListShown: boolean
}

@connectToStores([EditorStateStore], () => ({
    activeComp: EditorStateStore.getState().get('activeComp')
}))
export default class PreviewView extends React.Component<PreviewViewProps, PreviewViewState>
{
    public state = {
        scale: 1,
        scaleListShown: false
    }

    public refs: {
        canvas: HTMLCanvasElement
        scaleList: DropDown
    }

    protected componentDidMount()
    {
        // RendererService.renderer!.setDestinationCanvas(this.refs.canvas)
        RendererService.setDestCanvas(this.refs.canvas)
    }

    private selectScale = (e: React.MouseEvent<HTMLLIElement>) =>
    {
        this.refs.scaleList.hide()

        this.setState({
            scale: parseInt(e.target.dataset.value, 10) / 100,
            scaleListShown: false,
        })
    }

    private toggleScaleList = (e) =>
    {
        this.refs.scaleList.toggle()
    }

    private onWheel = e => {
        if (!e.altKey) return

        this.setState({
            scale: Math.max(.1, Math.min(this.state.scale + (-e.deltaY / 20), 3))
        })
    }

    public render()
    {
        const {activeComp} = this.props
        const {scale, scaleListShown} = this.state
        const currentScale = Math.round(scale * 100)
        const width = activeComp ? activeComp.width : 640
        const height = activeComp ? activeComp.height : 360

        return (
            <Pane className={s.Preview} allowFocus>
                <div className={s.Preview_Inner}>
                    <div className={s.Preview_Header}>{activeComp && activeComp.name}</div>
                    <div className={s.Preview_View} onWheel={this.onWheel}>
                        <canvas ref='canvas' className={s.PreviewView_Canvas} width={width} height={height} style={{transform:`scale(${this.state.scale})`}}/>
                    </div>
                    <div className={s.Preview_Footer}>
                        <label className={s.scaleLabel} onClick={this.toggleScaleList}>
                            {t('scale')}:
                            <span className={s.currentScale}>{currentScale}%</span>
                            <DropDown ref='scaleList' className={s.dropdown} shownInitial={scaleListShown}>
                                <li data-value="50" onClick={this.selectScale}>50%</li>
                                <li data-value="100" onClick={this.selectScale}>100%</li>
                                <li data-value="150" onClick={this.selectScale}>150%</li>
                                <li data-value="200" onClick={this.selectScale}>200%</li>
                                <li data-value="250" onClick={this.selectScale}>250%</li>
                                <li data-value="300" onClick={this.selectScale}>300%</li>
                            </DropDown>
                        </label>
                    </div>
                </div>
            </Pane>
        )
    }
}
