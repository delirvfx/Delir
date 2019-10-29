import { StoreGetter } from '@fleur/fleur'
import { connectToStores, ContextProp, withFleurContext } from '@fleur/react'
import React from 'react'
import { frameToTimeCode } from '../../utils/Timecode'

import { Dropdown } from '../../components/Dropdown'
import { Pane } from '../../components/Pane'

import EditorStore from '../../domain/Editor/EditorStore'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore, { RenderState } from '../../domain/Renderer/RendererStore'

import t from './PreviewView.i18n'
import s from './PreviewView.sass'

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

interface State {
  scale: number
  scaleListShown: boolean
  positionX: number
  positionY: number
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
        positionX: 0,
        positionY: 0,
      }

      private scaleListRef = React.createRef<Dropdown>()
      private canvasRef = React.createRef<HTMLCanvasElement>()

      public componentDidMount() {
        this.props.executeOperation(RendererOps.setPreviewCanvas, {
          canvas: this.canvasRef.current!,
        })

        window.addEventListener('wheel', e => {
          this.setState(state =>
            e.ctrlKey
              ? { scale: Math.max(0.05, state.scale - e.deltaY * 0.01) }
              : {
                  positionX: state.positionX - e.deltaX * 2,
                  positionY: state.positionY - e.deltaY * 2,
                },
          )
        })
      }

      public render() {
        const { activeComp, currentPreviewFrame, previewPlaying, lastRenderState } = this.props
        const { scale, positionX, positionY, scaleListShown } = this.state
        const currentScale = Math.round(scale * 100)
        const width = activeComp ? activeComp.width : 640
        const height = activeComp ? activeComp.height : 360
        const currentFrame = previewPlaying && lastRenderState ? lastRenderState.currentFrame : currentPreviewFrame
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
                    transform: `scale(${this.state.scale}) translateX(${positionX}px)
                      translateY(${positionY}px)`,
                  }}
                />
              </div>
              <div className={s.Preview_Footer}>
                <label className={s.FooterItem} onClick={this.toggleScaleList}>
                  <i className="fa fa-search-plus" />
                  <span className={s.currentScale}>{currentScale}%</span>
                  <Dropdown ref={this.scaleListRef} className={s.dropdown} shownInitial={scaleListShown}>
                    <div data-value="50" onClick={this.handleSelectScale}>
                      50%
                    </div>
                    <div data-value="100" onClick={this.handleSelectScale}>
                      100%
                    </div>
                    <div data-value="150" onClick={this.handleSelectScale}>
                      150%
                    </div>
                    <div data-value="200" onClick={this.handleSelectScale}>
                      200%
                    </div>
                    <div data-value="250" onClick={this.handleSelectScale}>
                      250%
                    </div>
                    <div data-value="300" onClick={this.handleSelectScale}>
                      300%
                    </div>
                  </Dropdown>
                </label>
                <div className={s.FooterItem}>{timecode}</div>
              </div>
            </div>
          </Pane>
        )
      }

      private handleSelectScale = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()

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
