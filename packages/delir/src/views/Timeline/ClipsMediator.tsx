import * as Delir from '@delirvfx/core'
import { ContextProp, withFleurContext } from '@fleur/react'
import Selection from '@simonwep/selection-js'
import React from 'react'
import { decorate } from '../../utils/decorate'

import * as EditorOps from '../../domain/Editor/operations'
import { getSelectedClips } from '../../domain/Editor/selectors'
import * as ProjectOps from '../../domain/Project/operations'

import { SpreadType } from '../../utils/Spread'
import TimePixelConversion from '../../utils/TimePixelConversion'
import { ClipDragContext, EmitClipDragHandler, EmitClipResizeHandler } from './ClipDragContext'
import Layer from './Layer'
import { PX_PER_SEC } from './Timeline'

import s from './ClipsMediator.sass'

interface OwnProps {
  comp: SpreadType<Delir.Entity.Composition>
  scale: number
  scrollLeft: number
  scrollWidth: number
}

interface State {
  clipDragOffset: { x: number; width: number }
}

type Props = ContextProp & OwnProps

export const ClipsMediator = decorate<OwnProps>(
  [withFleurContext],
  class ClipsMediator extends React.PureComponent<Props, State> {
    public state: State = {
      clipDragOffset: { x: 0, width: 0 },
    }

    private selection: Selection
    private root = React.createRef<HTMLDivElement>()

    public componentDidMount() {
      this.selection = Selection.create({
        class: s.selectionArea,
        selectionAreaContainer: this.root.current!,
        startareas: [`.${s.root}`],
        boundaries: [`.${s.root}`],
        selectables: ['[data-clip-id]'],
      })
        .on('beforestart', this.handleSelectionStartValidate)
        .on('stop', this.handleSelectionStop)
    }

    public componentWillUnmount() {
      this.selection.destroy()
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
            emitClipResize: this.handleClipResize,
            emitClipResizeEnd: this.handleClipResizeEnd,
          }}
        >
          <div ref={this.root} className={s.root}>
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
          </div>
        </ClipDragContext.Provider>
      )
    }

    private calcMovementFrame = (nextPx: number, originalFrameLength: number) => {
      const { comp, scale } = this.props
      return (
        TimePixelConversion.pixelToFrames({
          pxPerSec: PX_PER_SEC,
          framerate: comp.framerate,
          pixel: nextPx,
          scale: scale,
        }) - originalFrameLength
      )
    }

    private handleClipDragging: EmitClipDragHandler = ({ nextX, originalPlacedFrame }) => {
      const { comp, scale } = this.props
      const movementFrame = this.calcMovementFrame(nextX, originalPlacedFrame)
      const offsetX = TimePixelConversion.framesToPixel({
        pxPerSec: PX_PER_SEC,
        framerate: comp.framerate,
        durationFrames: movementFrame,
        scale: scale,
      })

      this.setState({ clipDragOffset: { x: offsetX, width: 0 } })
    }

    private handleClipDragEnd: EmitClipDragHandler = ({ nextX, originalPlacedFrame }) => {
      const clips = getSelectedClips()(this.props.getStore)
      const movementFrame = this.calcMovementFrame(nextX, originalPlacedFrame)
      const patches = clips.map(clip => {
        return {
          clipId: clip.id,
          patch: {
            placedFrame: clip.placedFrame + movementFrame,
          } as Partial<Delir.Entity.Clip>,
        }
      })

      this.props.executeOperation(ProjectOps.modifyClips, patches)
      this.setState({ clipDragOffset: { x: 0, width: 0 } })
    }

    private handleClipResize: EmitClipResizeHandler = ({ nextX, originalPlacedFrame, deltaWidth: nextWidth }) => {
      const { comp, scale } = this.props
      const sizingFrame = this.calcMovementFrame(nextWidth, 0)
      const movementFrame = this.calcMovementFrame(nextX, originalPlacedFrame)

      const offsetX = TimePixelConversion.framesToPixel({
        pxPerSec: PX_PER_SEC,
        framerate: comp.framerate,
        durationFrames: movementFrame,
        scale: scale,
      })

      const offsetWidth = TimePixelConversion.framesToPixel({
        pxPerSec: PX_PER_SEC,
        framerate: comp.framerate,
        durationFrames: sizingFrame,
        scale: scale,
      })

      this.setState({ clipDragOffset: { x: offsetX, width: offsetWidth } })
    }

    private handleClipResizeEnd: EmitClipResizeHandler = ({ nextX, originalPlacedFrame, deltaWidth: nextWidth }) => {
      const clips = getSelectedClips()(this.props.getStore)
      const sizingFrame = this.calcMovementFrame(nextWidth, 0)
      const movementFrame = this.calcMovementFrame(nextX, originalPlacedFrame)

      const patches = clips.map(clip => {
        return {
          clipId: clip.id,
          patch: {
            placedFrame: clip.placedFrame + movementFrame,
            durationFrames: clip.durationFrames + sizingFrame,
          } as Partial<Delir.Entity.Clip>,
        }
      })

      this.props.executeOperation(ProjectOps.modifyClips, patches)
      this.setState({ clipDragOffset: { x: 0, width: 0 } })
    }

    private handleSelectionStartValidate = ({ oe }: Selection.SelectionEvent) => {
      return !(oe.target as HTMLElement).closest('[data-clip-id]')
    }

    private handleSelectionStop = ({ oe, selected }: Selection.SelectionEvent) => {
      const clipIds = selected.map(el => (el as HTMLElement).dataset.clipId!)

      if (oe.shiftKey || oe.metaKey) {
        this.props.executeOperation(EditorOps.addOrRemoveSelectClip, { clipIds })
      } else {
        this.props.executeOperation(EditorOps.changeSelectClip, { clipIds })
      }
    }
  },
)
