import * as Delir from '@delirvfx/core'
import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as React from 'react'
import { decorate } from '../../utils/decorate'

import { getSelectedClips } from '../../domain/Editor/selectors'
import * as ProjectOps from '../../domain/Project/operations'

import { SpreadType } from '../../utils/Spread'
import TimePixelConversion from '../../utils/TimePixelConversion'
import { ClipDragContext } from './ClipDragContext'
import Layer from './Layer'
import { PX_PER_SEC } from './Timeline'

interface OwnProps {
    comp: SpreadType<Delir.Entity.Composition>
    scale: number
    scrollLeft: number
    scrollWidth: number
}

interface State {
    clipDragOffset: { x: number }
}

type Props = ContextProp & OwnProps

export const ClipsMediator = decorate(
    [withComponentContext],
    class ClipsMediator extends React.PureComponent<Props, State> {
        public state: State = {
            clipDragOffset: { x: 0 },
        }

        public render() {
            const { comp, scale, scrollLeft, scrollWidth } = this.props
            const { clipDragOffset } = this.state
            const { framerate } = comp

            return (
                <ClipDragContext.Provider
                    value={{
                        emitClipDrag: this.handleClipDragging,
                        emitClipDragEnd: this.handleClipDragEnd,
                    }}
                >
                    {comp.layers.map((layer, idx) => (
                        <Layer
                            key={layer.id!}
                            layer={{ ...layer }}
                            layerIndex={idx}
                            framerate={framerate}
                            pxPerSec={PX_PER_SEC}
                            scale={scale}
                            clipOffset={clipDragOffset}
                            scrollLeft={scrollLeft}
                            scrollWidth={scrollWidth}
                        />
                    ))}
                </ClipDragContext.Provider>
            )
        }

        private calcMovementFrame = (nextX: number, originalPlacedFrame: number) => {
            const { comp, scale } = this.props
            return (
                TimePixelConversion.pixelToFrames({
                    pxPerSec: PX_PER_SEC,
                    framerate: comp.framerate,
                    pixel: nextX,
                    scale: scale,
                }) - originalPlacedFrame
            )
        }

        private handleClipDragging = (x: number, originalPlacedFrame: number) => {
            const { comp, scale } = this.props
            const movementFrame = this.calcMovementFrame(x, originalPlacedFrame)
            const offsetX = TimePixelConversion.framesToPixel({
                pxPerSec: PX_PER_SEC,
                framerate: comp.framerate,
                durationFrames: movementFrame,
                scale: scale,
            })
            this.setState({ clipDragOffset: { x: offsetX } })
        }

        private handleClipDragEnd = (x: number, originalPlacedFrame: number) => {
            const clips = getSelectedClips()(this.props.context.getStore)
            const movementFrame = this.calcMovementFrame(x, originalPlacedFrame)
            const patches = clips.map(clip => {
                return {
                    clipId: clip.id,
                    patch: {
                        placedFrame: clip.placedFrame + movementFrame,
                    } as Partial<Delir.Entity.Clip>,
                }
            })

            this.props.context.executeOperation(ProjectOps.modifyClips, patches)
            this.setState({ clipDragOffset: { x: 0 } })
        }
    },
)
