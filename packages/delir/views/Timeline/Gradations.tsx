import * as Delir from '@delirvfx/core'
import { connectToStores, StoreGetter } from '@fleur/fleur-react'
import * as classnames from 'classnames'
import * as React from 'react'

import { SpreadType } from '../../utils/Spread'
import TimePixelConversion, { MeasurePoint } from '../../utils/TimePixelConversion'

import RendererStore from '../../domain/Renderer/RendererStore'

import { ContextMenu, MenuItem } from '../../components/ContextMenu/ContextMenu'

import t from './Gradations.i18n'
import * as s from './Gradations.styl'

interface OwnProps {
    currentFrame: number
    measures: MeasurePoint[]
    previewPlaying: boolean
    activeComposition: SpreadType<Delir.Entity.Composition> | null
    cursorHeight: number
    scrollLeft: number
    scale: number
    pxPerSec: number
    onSeeked: (frame: number) => any
}

type Props = OwnProps & ReturnType<typeof mapStoresToProps>

interface GradationsState {
    left: number
    dragSeekEnabled: boolean
}

const mapStoresToProps = (getStore: StoreGetter) => ({
    lastRenderState: getStore(RendererStore).getLastRenderState(),
})

export default connectToStores([RendererStore], mapStoresToProps)(
    class Gradations extends React.Component<Props, GradationsState> {
        public static defaultProps = {
            scrollLeft: 0,
        }

        public refs: {
            cursor: HTMLDivElement
            measureLayer: HTMLDivElement
        }

        public state = {
            left: 0,
            dragSeekEnabled: false,
        }

        private intervalId: number = -1

        public componentDidMount() {
            this.intervalId = requestAnimationFrame(this._updateCursor)
        }

        public componentWillUnmount() {
            cancelAnimationFrame(this.intervalId)
        }

        public render() {
            return (
                <div
                    className={s.Gradations}
                    onMouseDown={this._seeking}
                    onMouseMove={this._seeking}
                    onMouseUp={this._seeking}
                    onClick={this._seeking}
                >
                    <ContextMenu>
                        <MenuItem label={t(t.k.contextMenu.seekToHead)} onClick={this.seekToHead} />
                    </ContextMenu>
                    <div className={s.measureLayerTrimer}>
                        <div ref="measureLayer" className={s.measureLayer}>
                            {this._renderMeasure()}
                        </div>
                    </div>
                    <div
                        ref="cursor"
                        className={s.playingCursor}
                        style={{
                            height: `calc(100% + ${this.props.cursorHeight}px - 5px)`,
                        }}
                    />
                </div>
            )
        }

        private handleGlobalMouseUp = () => {
            window.addEventListener(
                'mouseup',
                e => {
                    this.setState({ dragSeekEnabled: false })
                },
                { once: true },
            )
        }

        private _updateCursor = () => {
            const { activeComposition, scrollLeft, scale, previewPlaying, currentFrame, lastRenderState } = this.props
            const { cursor, measureLayer } = this.refs

            const usingCurrentFrame = previewPlaying && lastRenderState ? lastRenderState.currentFrame : currentFrame

            if (activeComposition) {
                // Reactの仕組みを使うとrenderMeasureが走りまくってCPUがヤバいので
                // Reactのライフサイクルから外す
                const cursorLeft = TimePixelConversion.framesToPixel({
                    pxPerSec: 30,
                    framerate: activeComposition.framerate,
                    durationFrames: usingCurrentFrame,
                    scale,
                })

                cursor.style.display = cursorLeft - scrollLeft < 0 ? 'none' : 'block'
                cursor.style.left = `${cursorLeft}px`
                cursor.style.transform = `translateX(-${scrollLeft}px)`
                measureLayer.style.transform = `translateX(-${scrollLeft}px)`
            }

            this.intervalId = requestAnimationFrame(this._updateCursor)
        }

        private _seeking = ({ nativeEvent: e }: React.MouseEvent<HTMLDivElement>) => {
            // Accepy only "left only" click
            if (e.buttons !== 1) return

            if (e.type === 'mousedown') {
                this.setState({ dragSeekEnabled: true })
                this.handleGlobalMouseUp()
            }

            if (!this.state.dragSeekEnabled) return

            const { activeComposition, pxPerSec, scale, scrollLeft } = this.props

            if (!activeComposition) return

            const frame =
                TimePixelConversion.pixelToFrames({
                    pxPerSec,
                    framerate: activeComposition.framerate,
                    scale,
                    pixel: (e as MouseEvent).layerX + scrollLeft,
                }) | 0

            this.props.onSeeked(frame)
        }

        private seekToHead = () => {
            this.props.onSeeked(0)
        }

        private _renderMeasure = (): JSX.Element[] => {
            const { measures, activeComposition } = this.props
            const components: JSX.Element[] = []

            if (!activeComposition) return []

            for (const point of measures) {
                components.push(
                    <div
                        key={point.index}
                        className={classnames(s.measureLine, {
                            [s['--grid']]: point.frameNumber % 10 === 0,
                            [s['--endFrame']]: point.frameNumber === activeComposition.durationFrames,
                        })}
                        style={{ left: point.left }}
                    >
                        {point.frameNumber}
                    </div>,
                )
            }

            return components
        }
    },
)
