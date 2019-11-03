import * as Delir from '@delirvfx/core'
import { ContextProp, withFleurContext } from '@fleur/react'
import classnames from 'classnames'
import _ from 'lodash'
import React from 'react'
import { DraggableEventHandler } from 'react-draggable'
import { Rnd, RndResizeCallback } from 'react-rnd'
import { animated } from 'react-spring'
import { decorate } from '../../utils/decorate'
import { SpreadType } from '../../utils/Spread'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu/ContextMenu'
import { MountTransition } from '../../components/MountTransition'
import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import t from './Clip.i18n'
import s from './Clip.sass'
import { ClipDragProps, withClipDragContext } from './ClipDragContext'

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

export default decorate<OwnProps>(
  [withFleurContext, withClipDragContext],
  class Clip extends React.Component<Props> {
    private isDragMoved: boolean = false

    public shouldComponentUpdate(nextProps: Props) {
      const { props } = this
      return !_.isEqual(props, nextProps)
    }

    public render() {
      const { clip, active, postEffectPlugins, width, left, top, hasError } = this.props

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
              onDragStart={this.handleDragStart}
              onDrag={this.handleDrag}
              onDragStop={this.handleDragEnd}
              onResize={this.handleResize}
              onResizeStop={this.handleResizeEnd}
              tabIndex={-1}
              data-clip-id={clip.id}
              dragGrid={[1, 24]}
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
                  <MenuItem label={t(t.k.contextMenu.seekToHeadOfClip)} onClick={this.handleSeekToHeadOfClip} />
                  <MenuItem label={t(t.k.contextMenu.effect)}>
                    {postEffectPlugins.length ? (
                      postEffectPlugins.map(entry => (
                        <MenuItem
                          key={entry.id}
                          label={entry.name}
                          data-clip-id={clip.id}
                          data-effect-id={entry.id}
                          onClick={this.handleAddEffect}
                        />
                      ))
                    ) : (
                      <MenuItem label={t(t.k.contextMenu.pluginUnavailable)} enabled={false} />
                    )}
                  </MenuItem>
                  {/* <MenuItem label='Make alias ' onClick={this.makeAlias.bind(null, clip.id)} /> */}
                  <MenuItem type="separator" />
                  <MenuItem label={t(t.k.contextMenu.remove)} data-clip-id={clip.id} onClick={this.handleRemoveClip} />
                  <MenuItem type="separator" />
                </ContextMenu>
                <span className={s.nameLabel}>{t(['renderers', clip.renderer])}</span>
                <span className={s.idLabel}>#{clip.id.substring(0, 4)}</span>
              </animated.div>
            </Rnd>
          )}
        </MountTransition>
      )
    }

    private handleDragStart: DraggableEventHandler = e => {
      // When click with shift-key, Expects raise selection/deselection behaviour
      // (Prevent clip selection clearing)
      if (e.shiftKey) return

      // Enable dragging from unselected state
      if (!this.props.active) {
        this.props.executeOperation(EditorOps.changeSelectClip, {
          clipIds: [this.props.clip.id],
        })
      }

      this.props.executeOperation(EditorOps.setDragEntity, {
        entity: { type: 'clip', baseClipId: this.props.clip.id! },
      })
    }

    private handleDrag: DraggableEventHandler = (e, drag) => {
      const { clip } = this.props

      if (drag.deltaX !== 0 || drag.deltaY !== 0) {
        this.isDragMoved = true
      }

      this.props.emitClipDrag({
        nextX: drag.x,
        nextY: drag.y,
        originalPlacedFrame: clip.placedFrame,
      })
    }

    private handleDragEnd: DraggableEventHandler = (e, drag) => {
      const { clip, active } = this.props

      onClick: {
        // Prevent clip deselection after drag
        if (this.isDragMoved) {
          break onClick
        }

        if (active) return

        if (e.shiftKey) {
          this.props.executeOperation(EditorOps.addOrRemoveSelectClip, {
            clipIds: [clip.id],
          })
        } else {
          this.props.executeOperation(EditorOps.changeSelectClip, {
            clipIds: [clip.id!],
          })
        }
      }

      dragEnd: {
        if (!this.isDragMoved) {
          break dragEnd
        }

        // Delay clearing for drag handling in Layer component
        setTimeout(() => {
          this.props.executeOperation(EditorOps.clearDragEntity)
        })

        this.props.emitClipDragEnd({
          nextX: drag.x,
          nextY: drag.y,
          originalPlacedFrame: clip.placedFrame,
        })
      }

      this.isDragMoved = false
    }

    private handleResize: RndResizeCallback = (e, dir, ref, delta, pos) => {
      const { clip } = this.props

      // Enable dragging from unselected state
      if (!this.props.active) {
        this.props.executeOperation(EditorOps.changeSelectClip, {
          clipIds: [this.props.clip.id],
        })
      }

      this.props.emitClipResize({
        nextX: pos.x,
        originalPlacedFrame: clip.placedFrame,
        deltaWidth: delta.width,
      })
    }

    private handleResizeEnd: RndResizeCallback = (e, direction, ref, delta, pos) => {
      const { clip, width } = this.props

      this.props.emitClipResizeEnd({
        nextX: pos.x,
        originalPlacedFrame: clip.placedFrame,
        deltaWidth: delta.width,
      })
    }

    private handleAddEffect = ({ dataset }: MenuItemOption<{ clipId: string; effectId: string }>) => {
      this.props.executeOperation(ProjectOps.addEffectIntoClip, {
        clipId: dataset.clipId,
        processorId: dataset.effectId,
      })
      this.props.executeOperation(EditorOps.seekPreviewFrame, {})
    }

    private handleRemoveClip = ({ dataset }: MenuItemOption<{ clipId: string }>) => {
      this.props.executeOperation(ProjectOps.removeClips, {
        clipIds: [dataset.clipId],
      })
    }

    private handleSeekToHeadOfClip = () => {
      const { clip } = this.props
      this.props.executeOperation(EditorOps.seekPreviewFrame, {
        frame: clip.placedFrame,
      })
    }
  },
)
