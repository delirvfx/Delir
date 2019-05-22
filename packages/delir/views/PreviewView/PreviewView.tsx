import { connectToStores, ContextProp, StoreGetter, withFleurContext } from '@fleur/fleur-react'
import * as React from 'react'
import { frameToTimeCode } from '../../utils/Timecode'

import DropDown from '../../components/dropdown'
import Pane from '../../components/pane'

import EditorStore from '../../domain/Editor/EditorStore'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore, { RenderState } from '../../domain/Renderer/RendererStore'

import t from './PreviewView.i18n'
import * as s from './style.styl'

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

interface State {
    scale: number
    scaleListShown: boolean
}

const mapStoresToProps = (getStore: StoreGetter) => {
    const editorStore = getStore(EditorStore)

    return {
        activeComp: editorStore.getState().activeComp,
        currentPreviewFrame: editorStore.getState().currentPreviewFrame,
        previewPlaying: getStore(RendererStore).previewPlaying,
        lastRenderState: getStore(RendererStore).getLastRenderState(),
    }
}

export default withFleurContext(
    connectToStores([EditorStore, RendererStore], mapStoresToProps)(
        class PreviewView extends React.Component<Props, State> {
            public state = {
                scale: 1,
                scaleListShown: false,
            }

            private scaleListRef = React.createRef<DropDown>()
            private canvasRef = React.createRef<HTMLCanvasElement>()

            public componentDidMount() {
                this.props.executeOperation(RendererOps.setPreviewCanvas, {
                    canvas: this.canvasRef.current!,
                })
            }

            public render() {
                const { activeComp, currentPreviewFrame, previewPlaying, lastRenderState } = this.props
                const { scale, scaleListShown } = this.state
                const currentScale = Math.round(scale * 100)
                const width = activeComp ? activeComp.width : 640
                const height = activeComp ? activeComp.height : 360
                const currentFrame =
                    previewPlaying && lastRenderState ? lastRenderState.currentFrame : currentPreviewFrame
                const timecode = activeComp ? frameToTimeCode(currentFrame, activeComp.framerate) : '--:--:--:--'

                return (
                    <Pane className={s.Preview} allowFocus>
                        <div className={s.Preview_Inner}>
                            <div className={s.Preview_Header}>{activeComp && activeComp.name}</div>
                            <div className={s.Preview_View} onWheel={this.onWheel}>
                                <canvas
                                    ref={this.canvasRef}
                                    className={s.PreviewView_Canvas}
                                    width={width}
                                    height={height}
                                    style={{
                                        transform: `scale(${this.state.scale})`,
                                    }}
                                />
                            </div>
                            <div className={s.Preview_Footer}>
                                <label className={s.FooterItem} onClick={this.toggleScaleList}>
                                    <i className="fa fa-search-plus" />
                                    <span className={s.currentScale}>{currentScale}%</span>
                                    <DropDown
                                        ref={this.scaleListRef}
                                        className={s.dropdown}
                                        shownInitial={scaleListShown}
                                    >
                                        <li data-value="50" onClick={this.selectScale}>
                                            50%
                                        </li>
                                        <li data-value="100" onClick={this.selectScale}>
                                            100%
                                        </li>
                                        <li data-value="150" onClick={this.selectScale}>
                                            150%
                                        </li>
                                        <li data-value="200" onClick={this.selectScale}>
                                            200%
                                        </li>
                                        <li data-value="250" onClick={this.selectScale}>
                                            250%
                                        </li>
                                        <li data-value="300" onClick={this.selectScale}>
                                            300%
                                        </li>
                                    </DropDown>
                                </label>
                                <div className={s.FooterItem}>{timecode}</div>
                            </div>
                        </div>
                    </Pane>
                )
            }

            private selectScale = (e: React.MouseEvent<HTMLLIElement>) => {
                this.scaleListRef.current!.hide()

                this.setState({
                    scale: parseInt(e.currentTarget.dataset.value!, 10) / 100,
                    scaleListShown: false,
                })
            }

            private toggleScaleList = () => {
                this.scaleListRef.current!.toggle()
            }

            private onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
                if (!e.altKey) return

                this.setState({
                    scale: Math.max(0.1, Math.min(this.state.scale + -e.deltaY / 20, 3)),
                })
            }
        },
    ),
)
