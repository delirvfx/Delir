import * as Delir from '@delirvfx/core'
import classnames from 'classnames'
import _ from 'lodash'
import React, { useCallback, useRef } from 'react'
import { SpreadType } from '../../utils/Spread'
import TimePixelConversion from '../../utils/TimePixelConversion'

import * as EditorOps from '../../domain/Editor/operations'

import { useFleurContext, withFleurContext } from '@fleur/react'
import { useObjectState } from 'utils/hooks'
import s from './KeyframeGraph.sass'

interface Props {
  width: number
  height: number
  viewBox: string
  scrollLeft: number
  composition: SpreadType<Delir.Entity.Composition>
  parentClip: SpreadType<Delir.Entity.Clip>
  entity: SpreadType<Delir.Entity.Clip> | SpreadType<Delir.Entity.Effect> | null
  paramName: string
  descriptor: Delir.AnyParameterTypeDescriptor
  keyframes: ReadonlyArray<Delir.Entity.Keyframe>
  pxPerSec: number
  zoomScale: number
  onKeyframeRemove: (parentClipId: string, keyframeId: string) => void
  onModified: (parentClipId: string, paramName: string, frameOnClip: number, patch: KeyframePatch) => void
}

interface State {
  activeKeyframeId: string | null
  keyframeMovement: { x: number } | null
  easingHandleMovement: { x: number; y: number } | null
}

export interface KeyframePatch {
  easeInParam?: [number, number]
  easeOutParam?: [number, number]
  frameOnClip?: number
}

interface DragEasingHandler {
  type: 'ease-in' | 'ease-out'
  keyframeId: string
  element: SVGCircleElement
  container: SVGGElement
  initialPosition: { x: number; y: number }
}

const EASING_HANDLER_SIZE = 2.5

export default function KeyframeGraph({
  composition,
  descriptor,
  entity,
  height: graphHeight,
  keyframes,
  onKeyframeRemove,
  onModified,
  paramName,
  parentClip,
  pxPerSec,
  scrollLeft,
  viewBox,
  width,
  zoomScale,
}: Props) {
  const { executeOperation } = useFleurContext()

  const [{ activeKeyframeId, keyframeMovement, easingHandleMovement }, setState] = useObjectState<State>({
    activeKeyframeId: null,
    keyframeMovement: null,
    easingHandleMovement: null,
  })

  const _initialKeyframePosition = useRef<Record<'x' | 'y', number> | null>(null)
  const draggedEasingHandler = useRef<DragEasingHandler | null>(null)
  const draggedKeyframeId = useRef<string | null>(null)
  const _keyframeDragged = useRef<boolean>(false)

  const frameToPx = useCallback(
    (frame: number): number => {
      return TimePixelConversion.framesToPixel({
        pxPerSec,
        framerate: composition!.framerate,
        durationFrames: frame,
        scale: zoomScale,
      })
    },
    [pxPerSec, zoomScale, composition],
  )

  const pxToFrame = useCallback(
    (x: number): number => {
      return TimePixelConversion.pixelToFrames({
        framerate: composition!.framerate,
        pixel: x,
        pxPerSec,
        scale: zoomScale,
      })
    },
    [pxPerSec, zoomScale, composition],
  )

  const mouseMoveOnSvg = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (draggedKeyframeId.current != null) {
      _keyframeDragged.current = true

      setState({
        keyframeMovement: {
          x: e.screenX - _initialKeyframePosition.current!.x,
        },
      })
    } else if (draggedEasingHandler.current) {
      setState({
        easingHandleMovement: {
          x: e.screenX - draggedEasingHandler.current.initialPosition!.x,
          y: e.screenY - draggedEasingHandler.current.initialPosition!.y,
        },
      })
    }
  }, [])

  const mouseUpOnSvg = useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (!parentClip || !paramName || !entity) return

      process: {
        if (draggedKeyframeId.current) {
          // Process for keyframe dragged
          if (!_keyframeDragged.current) {
            setState({
              activeKeyframeId: draggedKeyframeId.current,
              keyframeMovement: null,
            })

            break process
          }

          if (!keyframeMovement) break process

          const keyframe = keyframes.find((kf) => kf.id === draggedKeyframeId.current)!
          const movedFrame = pxToFrame(keyframeMovement.x)

          onModified(parentClip.id, paramName, keyframe.frameOnClip, {
            frameOnClip: keyframe.frameOnClip + movedFrame,
          })
        } else if (draggedEasingHandler.current) {
          // Process for easing handle dragged

          const data = draggedEasingHandler.current
          const transitionPath = draggedEasingHandler.current.container.querySelector(
            '[data-transition-path]',
          )! as HTMLElement

          const keyframes = entity.keyframes[paramName].slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)
          const keyframeIdx = keyframes.findIndex((kf) => kf.id === draggedEasingHandler.current!.keyframeId)!
          if (keyframeIdx === -1) break process

          const { beginX, beginY, endX, endY } = _.mapValues(transitionPath.dataset, (val) => parseFloat(val!))
          const rect = {
            width: endX - beginX,
            height: endY - beginY,
          }
          const handlePosition = {
            x: data.element.cx.baseVal.value,
            y: data.element.cy.baseVal.value,
          }

          const easeParam: [number, number] = [
            (handlePosition.x - beginX) / rect.width,
            // guard from division by 0
            rect.height === 0 ? 0 : (handlePosition.y - beginY) / rect.height,
          ]

          if (data.type === 'ease-in') {
            const keyframe = keyframes[keyframeIdx + 1]
            onModified(parentClip.id, paramName, keyframe.frameOnClip, {
              easeInParam: easeParam,
            })
          } else if (data.type === 'ease-out') {
            const keyframe = keyframes[keyframeIdx]
            onModified(parentClip.id, paramName, keyframe.frameOnClip, {
              easeOutParam: easeParam,
            })
          }
        }
      }

      // Clear dragging state
      draggedKeyframeId.current = null
      _keyframeDragged.current = false
      draggedEasingHandler.current = null

      setState({
        keyframeMovement: null,
        easingHandleMovement: null,
      })
    },
    [parentClip, entity, paramName, keyframes, onModified, keyframeMovement],
  )

  const keydownOnKeyframeGraph = useCallback(
    (e: React.KeyboardEvent<SVGElement>) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeKeyframeId) {
        onKeyframeRemove(parentClip.id, activeKeyframeId)
        draggedKeyframeId.current = null
      }
    },
    [parentClip, onKeyframeRemove, activeKeyframeId],
  )

  const mouseDownOnEasingHandle = useCallback((e: React.MouseEvent<SVGCircleElement>) => {
    const { dataset } = e.currentTarget as any

    draggedEasingHandler.current = {
      type: dataset.isEaseIn ? 'ease-in' : 'ease-out',
      keyframeId: dataset.keyframeId,
      element: e.currentTarget,
      container: (e.currentTarget.parentElement! as any) as SVGGElement,
      initialPosition: { x: e.screenX, y: e.screenY },
    }
  }, [])

  const mouseDownOnKeyframe = useCallback((e: React.MouseEvent<SVGGElement>) => {
    draggedKeyframeId.current = (e.currentTarget as any).dataset.keyframeId
    _keyframeDragged.current = false
    _initialKeyframePosition.current = { x: e.screenX, y: e.screenY }
    setState({ activeKeyframeId: draggedKeyframeId.current })
  }, [])

  const doubleClickOnKeyframe = useCallback(
    ({ currentTarget }: React.MouseEvent<SVGGElement>) => {
      if (!parentClip) return

      executeOperation(EditorOps.seekPreviewFrame, {
        frame: parentClip.placedFrame + parseInt(currentTarget.dataset!.frame!, 10),
      })
    },
    [parentClip],
  )

  const _renderNumberKeyframes = (keyframes: ReadonlyArray<Delir.Entity.Keyframe>) => {
    const points = buildKeyframePoints(keyframes)
    const NO_TRANSFORM = { x: 0, y: 0 }
    const selectedEasingHandler = draggedEasingHandler.current

    return points
      .map((point, idx) => {
        const keyframeDragMovement =
          keyframeMovement && point.keyframeId === draggedKeyframeId.current ? keyframeMovement : NO_TRANSFORM
        const easingHandleDragMovement =
          easingHandleMovement && point.keyframeId === draggedEasingHandler.current!.keyframeId
            ? easingHandleMovement
            : NO_TRANSFORM
        const easeOutHandleDragMovement =
          selectedEasingHandler && selectedEasingHandler!.type === 'ease-out' ? easingHandleDragMovement : NO_TRANSFORM
        const easeIntHandleDragMovement =
          selectedEasingHandler && selectedEasingHandler!.type === 'ease-in' ? easingHandleDragMovement : NO_TRANSFORM

        return (
          <g key={point.keyframeId} data-index={idx}>
            {point.transitionPath && (
              <path
                stroke="#fff"
                fill="none"
                strokeWidth="1"
                d={`
                              M ${point.transitionPath.begin.x} ${point.transitionPath.begin.y}
                              C ${point.transitionPath.begin.handleX + easeOutHandleDragMovement.x} ${
                  point.transitionPath.begin.handleY + easeOutHandleDragMovement.y
                }
                                ${point.transitionPath.end.handleX + easeIntHandleDragMovement.x} ${
                  point.transitionPath.end.handleY + easeIntHandleDragMovement.y
                }
                                ${point.transitionPath.end.x} ${point.transitionPath.end.y}
                          `}
                data-begin-x={point.transitionPath.begin.x}
                data-begin-y={point.transitionPath.begin.y}
                data-end-x={point.transitionPath.end.x}
                data-end-y={point.transitionPath.end.y}
                data-transition-path
              />
            )}
            {point.easeOutLine && (
              <path
                className={s.keyframeLineToHandle}
                strokeWidth="1"
                d={`
                              M ${point.easeOutLine.x} ${point.easeOutLine.y}
                              L ${point.easeOutLine.endX + easeOutHandleDragMovement.x} ${
                  point.easeOutLine.endY + easeOutHandleDragMovement.y
                }
                          `}
                data-ease-out-handle-path
              />
            )}
            {point.nextEaseInLine && (
              <path
                className={s.keyframeLineToHandle}
                strokeWidth="1"
                d={`
                              M ${point.nextEaseInLine.x} ${point.nextEaseInLine.y}
                              L ${point.nextEaseInLine.endX + easeIntHandleDragMovement.x} ${
                  point.nextEaseInLine.endY + easeIntHandleDragMovement.y
                }
                          `}
                data-ease-in-handle-path
              />
            )}
            <g
              transform={`translate(${point.point.x + keyframeDragMovement.x - 4} ${point.point.y - 4})`}
              onDoubleClick={doubleClickOnKeyframe}
              onMouseDown={mouseDownOnKeyframe}
              onMouseUp={mouseUpOnSvg}
              data-keyframe-id={point.keyframeId}
              data-frame={point.frame}
            >
              <rect
                className={classnames(s.keyframeInner, {
                  [s['keyframeInner--selected']]: point.keyframeId === activeKeyframeId,
                })}
                width="8"
                height="8"
              />
            </g>
            {point.nextEaseInHandle && (
              <circle
                cx={point.nextEaseInHandle.x + easeIntHandleDragMovement.x}
                cy={point.nextEaseInHandle.y + easeIntHandleDragMovement.y}
                fill="#7100bf"
                r={EASING_HANDLER_SIZE}
                onMouseDown={mouseDownOnEasingHandle}
                onMouseUp={mouseUpOnSvg}
                data-keyframe-id={point.keyframeId}
                data-is-ease-in
              />
            )}
            {point.easeOutHandle && (
              <circle
                cx={point.easeOutHandle.x + easeOutHandleDragMovement.x}
                cy={point.easeOutHandle.y + easeOutHandleDragMovement.y}
                fill="#7100bf"
                r={EASING_HANDLER_SIZE}
                onMouseDown={mouseDownOnEasingHandle}
                onMouseUp={mouseUpOnSvg}
                data-keyframe-id={point.keyframeId}
                data-is-ease-out
              />
            )}
          </g>
        )
      })
      .reverse()
  }

  const _renderColorKeyframes = (keyframes: ReadonlyArray<Delir.Entity.Keyframe>) => {
    const halfHeight = graphHeight / 2

    if (!parentClip) return []

    const clipPlacedPositionX = frameToPx(parentClip.placedFrame) - scrollLeft
    const orderedKeyframes = keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)

    return orderedKeyframes.map((kf, idx) => {
      const x = clipPlacedPositionX + frameToPx(kf.frameOnClip)
      const nextX = orderedKeyframes[idx + 1]
        ? clipPlacedPositionX + frameToPx(orderedKeyframes[idx + 1].frameOnClip)
        : null
      const transform = keyframeMovement && kf.id === draggedKeyframeId ? keyframeMovement : { x: 0 }

      return (
        <g>
          {nextX != null && (
            <path
              stroke="#fff"
              fill="none"
              strokeWidth="1"
              d={`M ${x + 4} ${halfHeight + 4} L ${nextX - 4} ${halfHeight + 4}`}
            />
          )}
          <g
            className={classnames(s.keyframe, s['keyframe--color'])}
            transform={`translate(${x + transform.x - 4} ${halfHeight})`}
            onDoubleClick={doubleClickOnKeyframe}
            onMouseDown={mouseDownOnKeyframe}
            onMouseUp={mouseUpOnSvg}
            data-keyframe-id={kf.id}
            data-frame={kf.frameOnClip}
          >
            <rect
              className={classnames(s.keyframeInner, {
                [s['keyframeInner--selected']]: kf.id === activeKeyframeId,
              })}
              width="8"
              height="8"
              stroke="#fff"
              strokeWidth="1"
              style={{
                fill: (kf.value as Delir.Values.ColorRGBA).toString(),
              }}
            />
          </g>
        </g>
      )
    })
  }

  const _renderStringKeyframes = (keyframes: ReadonlyArray<Delir.Entity.Keyframe>) => {
    const halfHeight = graphHeight / 2

    if (!parentClip) return []
    const clipPlacedPositionX = frameToPx(parentClip.placedFrame) - scrollLeft
    const orderedKeyframes = keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)

    return orderedKeyframes.map((kf, idx) => {
      const x = clipPlacedPositionX + frameToPx(kf.frameOnClip)
      const nextX = orderedKeyframes[idx + 1]
        ? clipPlacedPositionX + frameToPx(orderedKeyframes[idx + 1].frameOnClip)
        : null
      const transform = keyframeMovement && kf.id === draggedKeyframeId ? keyframeMovement : { x: 0 }

      return (
        <g>
          {nextX != null && (
            <path
              stroke="#fff"
              fill="none"
              strokeWidth="1"
              d={`M ${x + 4} ${halfHeight + 4} L ${nextX - 4} ${halfHeight + 4}`}
            />
          )}
          <g
            transform={`translate(${x + transform.x - 4} ${halfHeight})`}
            onDoubleClick={doubleClickOnKeyframe}
            onMouseDown={mouseDownOnKeyframe}
            onMouseUp={mouseUpOnSvg}
            data-keyframe-id={kf.id}
            data-frame={kf.frameOnClip}
          >
            <rect
              className={classnames(s.keyframeInner, {
                [s['keyframeInner--selected']]: kf.id === activeKeyframeId,
              })}
              width="8"
              height="8"
              fill="#fff"
            />
          </g>
        </g>
      )
    })
  }

  /**
   * Calculate keyframe place points
   */
  const buildKeyframePoints = useCallback((keyframes: ReadonlyArray<Delir.Entity.Keyframe>) => {
    if (!descriptor || descriptor.animatable === false) return []

    const orderedKeyframes = keyframes.slice(0).sort((a, b) => a.frameOnClip - b.frameOnClip)
    const clipPlacedPositionX = frameToPx(parentClip.placedFrame)

    if (descriptor.type === 'NUMBER' || descriptor.type === 'FLOAT') {
      const maxValue =
        orderedKeyframes.reduce((memo, kf, idx, list) => {
          return Math.max(memo, kf.value as number) // , prevValue, nextValue)
        }, -Infinity) + 10

      const minValue =
        orderedKeyframes.reduce((memo, kf, idx, list) => {
          return Math.min(memo, kf.value as number) // , prevValue, nextValue)
        }, +Infinity) + -10

      const absMinValue = Math.abs(minValue)
      const minMaxRange = maxValue - minValue

      // Calc keyframe and handle points
      return orderedKeyframes.map((keyframe, idx) => {
        const nextKeyframe: Delir.Entity.Keyframe | undefined = orderedKeyframes[idx + 1]

        let nextX = 0
        let nextY = 0
        let easeOutHandleX = 0
        let easeOutHandleY = 0
        let nextKeyframeEaseInX = 0
        let nextKeyframeEaseInY = 0

        const beginX = clipPlacedPositionX + frameToPx(keyframe.frameOnClip) - scrollLeft
        const beginY = graphHeight - graphHeight * (((keyframe.value as number) - minValue) / minMaxRange)

        if (nextKeyframe) {
          // Next keyframe position
          nextX = clipPlacedPositionX + frameToPx(nextKeyframe.frameOnClip) - scrollLeft
          nextY = graphHeight - graphHeight * (((nextKeyframe.value as number) - minValue) / minMaxRange)

          // Handle of control transition to next keyframe
          easeOutHandleX = (nextX - beginX) * keyframe.easeOutParam[0] + beginX
          easeOutHandleY = (nextY - beginY) * keyframe.easeOutParam[1] + beginY // ((endPointY - beginY) * nextKeyframe.easeOutParam[1]) + beginY

          nextKeyframeEaseInX = (nextX - beginX) * nextKeyframe.easeInParam[0] + beginX
          nextKeyframeEaseInY = (nextY - beginY) * nextKeyframe.easeInParam[1] + beginY
        }

        return {
          keyframeId: keyframe.id,
          frame: keyframe.frameOnClip,
          point: { x: beginX, y: beginY },
          transitionPath: nextKeyframe
            ? {
                begin: {
                  x: beginX,
                  y: beginY,
                  handleX: easeOutHandleX,
                  handleY: easeOutHandleY,
                },
                end: {
                  x: nextX,
                  y: nextY,
                  handleX: nextKeyframeEaseInX,
                  handleY: nextKeyframeEaseInY,
                },
              }
            : null,
          easeOutLine: nextKeyframe
            ? {
                x: beginX,
                y: beginY,
                endX: easeOutHandleX,
                endY: easeOutHandleY,
              }
            : null,
          nextEaseInLine: nextKeyframe
            ? {
                x: nextX,
                y: nextY,
                endX: nextKeyframeEaseInX,
                endY: nextKeyframeEaseInY,
              }
            : null,
          easeOutHandle: nextKeyframe ? { x: easeOutHandleX, y: easeOutHandleY } : null,
          nextEaseInHandle: nextKeyframe ? { x: nextKeyframeEaseInX, y: nextKeyframeEaseInY } : null,
        }
      })
    }

    return []
  }, [])

  return (
    <svg
      className={s.keyframeGraph}
      viewBox={viewBox}
      width={width}
      height={graphHeight}
      onMouseMove={mouseMoveOnSvg}
      onMouseUp={mouseUpOnSvg}
      onKeyDown={keydownOnKeyframeGraph}
      tabIndex={-1}
    >
      {descriptor.animatable &&
        (() => {
          switch (descriptor.type) {
            case 'COLOR_RGB':
            case 'COLOR_RGBA':
              return _renderColorKeyframes(keyframes)

            case 'FLOAT':
            case 'NUMBER':
              return _renderNumberKeyframes(keyframes)

            case 'STRING':
              return _renderStringKeyframes(keyframes)
          }
        })()}
    </svg>
  )
}
