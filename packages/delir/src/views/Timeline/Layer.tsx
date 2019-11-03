import * as Delir from '@delirvfx/core'
import { useFleurContext, useStore } from '@fleur/react'
import classnames from 'classnames'
import _ from 'lodash'
import React, { useCallback } from 'react'
import { useObjectState } from 'utils/hooks'
import { SpreadType } from '../../utils/Spread'

import * as EditorOps from '../../domain/Editor/operations'
import * as ProjectOps from '../../domain/Project/operations'

import { ContextMenu, MenuItem, MenuItemOption } from '../../components/ContextMenu/ContextMenu'
import EditorStore from '../../domain/Editor/EditorStore'
import { getActiveLayerId, getSelectedClipIds, getSelectedClips } from '../../domain/Editor/selectors'
import { hasErrorInClip } from '../../domain/Renderer/models'
import RendererStore from '../../domain/Renderer/RendererStore'
import TimePixelConversion from '../../utils/TimePixelConversion'

import { GlobalEvent, GlobalEvents } from '../AppView/GlobalEvents'
import Clip from './Clip'

import t from './Layer.i18n'
import s from './Layer.sass'

interface Props {
  layer: SpreadType<Delir.Entity.Layer>
  layerIndex: number
  framerate: number
  pxPerSec: number
  scale: number
  clipOffset: { x: number; y: number; width: number }
  scrollLeft: number
  scrollWidth: number
}

interface State {
  dragovered: boolean
}

export const Layer = (props: Props) => {
  const [{ dragovered }, setState] = useObjectState<State>({ dragovered: false })
  const { executeOperation, getStore } = useFleurContext()

  const { selectedClipIds, activeLayerId, postEffectPlugins, userCodeException } = useStore(
    [EditorStore, RendererStore],
    getStore => ({
      activeLayerId: getActiveLayerId(getStore),
      selectedClipIds: getSelectedClipIds(getStore),
      postEffectPlugins: getStore(RendererStore).getPostEffectPlugins(),
      userCodeException: getStore(RendererStore).getUserCodeException(),
    }),
  )

  const { layer, framerate, pxPerSec, scale, scrollLeft, clipOffset, scrollWidth, layerIndex } = props

  const clips = Array.from(layer.clips)
  const convertOption = { pxPerSec, framerate, scale }

  const handleGlobalPaste = useCallback(() => {
    executeOperation(EditorOps.pasteClipIntoLayer, {
      layerId: layer.id,
    })
  }, [layer])

  const handleFocus = useCallback(() => {
    GlobalEvents.on(GlobalEvent.pasteViaApplicationMenu, handleGlobalPaste)
  }, [])

  const handleBlur = useCallback(() => {
    GlobalEvents.off(GlobalEvent.pasteViaApplicationMenu, handleGlobalPaste)
  }, [])

  const handleDragOver = useCallback(() => {
    const { dragEntity } = getStore(EditorStore)
    if (!dragEntity || dragEntity.type !== 'asset') return
    setState({ dragovered: true })
  }, [])

  const handleDragLeave = useCallback(() => {
    const { dragEntity } = getStore(EditorStore)
    if (!dragEntity || dragEntity.type !== 'asset') return
    setState({ dragovered: false })
  }, [])

  const handleOnDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const { dragEntity } = getStore(EditorStore)
      if (!dragEntity) return

      if (dragEntity.type === 'asset') {
        // Drop asset into ClipSpace
        const { asset } = dragEntity
        const { framerate, pxPerSec, scale } = props
        const placedFrame = TimePixelConversion.pixelToFrames({
          pxPerSec,
          framerate,
          pixel: (e.nativeEvent as any).layerX as number,
          scale,
        })
        executeOperation(ProjectOps.addClipWithAsset, {
          targetLayerId: layer.id,
          assetId: asset.id,
          placedFrame,
        })
      } else {
        return
      }

      executeOperation(EditorOps.clearDragEntity)
      setState({ dragovered: false })

      e.preventDefault()
      e.stopPropagation()
    },
    [layer],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onDrop: {
        const { dragEntity } = getStore(EditorStore)
        const clipIds = getSelectedClipIds(getStore)

        if (!dragEntity || dragEntity.type !== 'clip') break onDrop

        const droppedLayerDom = document
          .elementsFromPoint(e.clientX, e.clientY)
          .find(el => el.matches('[data-layer-mark-fas43fa]')) as HTMLElement

        if (!droppedLayerDom) break onDrop

        const droppedLayerId = droppedLayerDom.dataset.layerId!

        executeOperation(ProjectOps.moveClipToLayer, {
          baseClipId: dragEntity.baseClipId,
          clipIds,
          moveDestLayerId: droppedLayerId,
        })
        executeOperation(EditorOps.changeActiveLayer, droppedLayerId)
        executeOperation(EditorOps.clearDragEntity)
      }

      onMouseUp: {
        const isOnClip = e.nativeEvent.composedPath().find((el: Element) => el.matches && el.matches('[data-clip-id]'))
        if (!isOnClip) executeOperation(EditorOps.changeSelectClip, { clipIds: [] })
        executeOperation(EditorOps.changeActiveLayer, layer.id)
      }
    },
    [layer],
  )

  const handleAddNewClip = useCallback(
    ({ dataset }: MenuItemOption<{ rendererId: string }>) => {
      executeOperation(ProjectOps.addClip, {
        layerId: layer.id!,
        clipRendererId: dataset.rendererId,
      })
    },
    [layer],
  )

  const handleAddLayer = useCallback(() => {
    const { activeComp } = getStore(EditorStore)
    if (!activeComp) return

    executeOperation(ProjectOps.addLayer, {
      targetCompositionId: activeComp.id,
      index: layerIndex,
    })
  }, [layerIndex])

  return (
    <div
      className={classnames(s.Layer, {
        [s.dragover]: dragovered,
        [s.active]: activeLayerId === layer.id,
      })}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleOnDrop}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{ width: scrollWidth }}
      tabIndex={-1}
      data-layer-id={layer.id}
      data-layer-mark-fas43fa
    >
      <ContextMenu>
        <MenuItem type="separator" />
        <MenuItem label={t(t.k.contextMenu.createClip)}>
          {_.map(Delir.Engine.Renderers.RENDERERS, (renderer, idx) => (
            <MenuItem
              key={idx}
              label={t(['renderers', renderer.rendererId])}
              data-renderer-id={renderer.rendererId}
              onClick={handleAddNewClip}
            />
          ))}
        </MenuItem>
        <MenuItem type="separator" />
        <MenuItem label={t(t.k.contextMenu.addLayerHere)} onClick={handleAddLayer} />
      </ContextMenu>

      <div className={s.clipsContainer}>
        {clips.map(clip => {
          const width = TimePixelConversion.framesToPixel({
            durationFrames: clip.durationFrames | 0,
            ...convertOption,
          })

          const left = TimePixelConversion.framesToPixel({
            durationFrames: clip.placedFrame | 0,
            ...convertOption,
          })

          const hasError = hasErrorInClip(clip, userCodeException)
          const active = selectedClipIds.includes(clip.id)

          return (
            <Clip
              key={clip.id!}
              clip={{ ...clip }}
              width={active ? width + clipOffset.width : width}
              top={active ? clipOffset.y : 0}
              left={active ? left + clipOffset.x : left}
              active={active}
              postEffectPlugins={postEffectPlugins}
              hasError={hasError}
            />
          )
        })}
      </div>
    </div>
  )
}
