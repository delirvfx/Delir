import * as Delir from '@delirvfx/core'
import { ContextProp, useFleurContext } from '@fleur/react'
import classnames from 'classnames'
import _ from 'lodash'
import React, { useCallback, useRef } from 'react'
import { DraggableEventHandler } from 'react-draggable'
import { Rnd, RndResizeCallback } from 'react-rnd'
import { animated } from 'react-spring'
import { SpreadType } from '../../utils/Spread'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu/ContextMenu'
import { MountTransition } from '../../components/MountTransition'
import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import { getSelectedClipIds } from 'domain/Editor/selectors'
import { memo } from 'react'
import t from './Clip.i18n'
import s from './Clip.sass'
import { ClipDragProps, useClipDragContext } from './ClipDragContext'

interface OwnProps {
  clip: SpreadType<Delir.Entity.Clip>
  top: number
  left: number
  width: number
  active: boolean
  postEffectPlugins: Delir.PluginSupport.Types.PluginSummary[]
  hasError: boolean
}

interface ConnectedProps {
  postEffectPlugins: Delir.PluginSupport.Types.PluginSummary[]
}

type Props = OwnProps & ConnectedProps & ContextProp & ClipDragProps

export const Clip = memo(({ clip, active, postEffectPlugins, width, left, top, hasError }: OwnProps) => {
  const { executeOperation, getStore } = useFleurContext()
  const { emitClipDrag, emitClipDragEnd, emitClipResize, emitClipResizeEnd } = useClipDragContext()

  const isDragMoved = useRef<boolean>(false)

  const handleDragStart: DraggableEventHandler = useCallback(
    e => {
      // When click with shift-key, Expects raise selection/deselection behaviour
      // (Prevent clip selection clearing)
      if (e.shiftKey) return

      // Enable dragging from unselected state
      if (!active) {
        executeOperation(EditorOps.changeSelectClip, {
          clipIds: [clip.id],
        })
      }

      executeOperation(EditorOps.setDragEntity, {
        entity: { type: 'clip', baseClipId: clip.id! },
      })
    },
    [active, clip],
  )

  const handleDrag: DraggableEventHandler = useCallback(
    (e, drag) => {
      if (drag.deltaX !== 0 || drag.deltaY !== 0) {
        isDragMoved.current = true
      }

      emitClipDrag({
        nextX: drag.x,
        nextY: drag.y,
        originalPlacedFrame: clip.placedFrame,
      })
    },
    [clip, emitClipDrag],
  )

  const handleDragEnd: DraggableEventHandler = useCallback(
    (e, drag) => {
      onClick: {
        // Prevent clip deselection after drag
        if (isDragMoved.current) {
          break onClick
        }

        if (active) return

        if (e.shiftKey) {
          executeOperation(EditorOps.addOrRemoveSelectClip, {
            clipIds: [clip.id],
          })
        } else {
          executeOperation(EditorOps.changeSelectClip, {
            clipIds: [clip.id!],
          })
        }
      }

      dragEnd: {
        if (!isDragMoved.current) {
          break dragEnd
        }

        // Delay clearing for drag handling in Layer component
        setTimeout(() => {
          executeOperation(EditorOps.clearDragEntity)
        })

        emitClipDragEnd({
          nextX: drag.x,
          nextY: drag.y,
          originalPlacedFrame: clip.placedFrame,
        })
      }

      isDragMoved.current = false
    },
    [clip, emitClipDragEnd],
  )

  const handleResize: RndResizeCallback = useCallback(
    (e, dir, ref, delta, pos) => {
      // Enable dragging from unselected state
      if (!active) {
        executeOperation(EditorOps.changeSelectClip, {
          clipIds: [clip.id],
        })
      }

      emitClipResize({
        nextX: pos.x,
        originalPlacedFrame: clip.placedFrame,
        deltaWidth: delta.width,
      })
    },
    [active, clip, emitClipResize],
  )

  const handleResizeEnd: RndResizeCallback = useCallback(
    (e, direction, ref, delta, pos) => {
      emitClipResizeEnd({
        nextX: pos.x,
        originalPlacedFrame: clip.placedFrame,
        deltaWidth: delta.width,
      })
    },
    [clip, emitClipResizeEnd],
  )

  const handleAddEffect = useCallback(({ dataset }: MenuItemOption<{ clipId: string; effectId: string }>) => {
    executeOperation(ProjectOps.addEffectIntoClip, {
      clipId: dataset.clipId,
      processorId: dataset.effectId,
    })
    executeOperation(EditorOps.seekPreviewFrame, {})
  }, [])

  const handleRemoveClip = useCallback(
    ({ dataset }: MenuItemOption<{ clipId: string }>) => {
      if (active) {
        executeOperation(ProjectOps.removeClips, {
          clipIds: getSelectedClipIds(getStore),
        })
      } else {
        executeOperation(ProjectOps.removeClips, {
          clipIds: [dataset.clipId],
        })
      }
    },
    [active],
  )

  const handleSeekToHeadOfClip = useCallback(() => {
    executeOperation(EditorOps.seekPreviewFrame, {
      frame: clip.placedFrame,
    })
  }, [clip])

  return (
    <MountTransition
      from={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
      enter={{ transform: 'scaleX(1)' }}
    >
      {style => (
        <Rnd
          className={s.clip}
          dragAxis="both"
          position={{ x: left, y: 2 + top }}
          size={{ width, height: 'auto' }}
          enableResizing={{
            left: true,
            right: true,
            top: false,
            bottom: false,
          }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragStop={handleDragEnd}
          onResize={handleResize}
          onResizeStop={handleResizeEnd}
          tabIndex={-1}
          data-clip-id={clip.id}
          dragGrid={[1, 24]}
          style={{ zIndex: active ? 1 : undefined }}
        >
          <animated.div
            className={classnames(s.inner, {
              [s.active]: active,
              [s.video]: clip.renderer === 'video',
              [s.audio]: clip.renderer === 'audio',
              [s.text]: clip.renderer === 'text',
              [s.image]: clip.renderer === 'image',
              [s.adjustment]: clip.renderer === 'adjustment',
              [s.p5js]: clip.renderer === 'p5js',
              [s.solid]: clip.renderer === 'solid',
              [s.hasError]: hasError,
            })}
            style={style}
          >
            <ContextMenu>
              <MenuItem label={t(t.k.contextMenu.seekToHeadOfClip)} onClick={handleSeekToHeadOfClip} />
              <MenuItem label={t(t.k.contextMenu.effect)}>
                {postEffectPlugins.length ? (
                  postEffectPlugins.map(entry => (
                    <MenuItem
                      key={entry.id}
                      label={entry.name}
                      data-clip-id={clip.id}
                      data-effect-id={entry.id}
                      onClick={handleAddEffect}
                    />
                  ))
                ) : (
                  <MenuItem label={t(t.k.contextMenu.pluginUnavailable)} enabled={false} />
                )}
              </MenuItem>
              {/* <MenuItem label='Make alias ' onClick={this.makeAlias.bind(null, clip.id)} /> */}
              <MenuItem type="separator" />
              <MenuItem label={t(t.k.contextMenu.remove)} data-clip-id={clip.id} onClick={handleRemoveClip} />
              <MenuItem type="separator" />
            </ContextMenu>
            <span className={s.nameLabel}>{t(['renderers', clip.renderer])}</span>
            <span className={s.idLabel}>#{clip.id.substring(0, 4)}</span>
          </animated.div>
        </Rnd>
      )}
    </MountTransition>
  )
})
