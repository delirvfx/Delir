import * as Delir from '@delirvfx/core'
import { useStore } from '@fleur/react'
import React from 'react'

import { getActiveComp } from '../../domain/Editor/selectors'

import EditorStore from '../../domain/Editor/EditorStore'
import { SpreadType } from '../../utils/Spread'
import KeyframeGraph, { KeyframePatch } from './KeyframeGraph'

interface OwnProps {
  activeClip: SpreadType<Delir.Entity.Clip>
  entity: SpreadType<Delir.Entity.Clip> | SpreadType<Delir.Entity.Effect> | null
  paramName: string
  descriptor: Delir.AnyParameterTypeDescriptor
  keyframeViewViewBox: { width: number; height: number } | undefined
  graphWidth: number
  graphHeight: number
  scrollLeft: number
  pxPerSec: number
  scale: number
  keyframes: readonly Delir.Entity.Keyframe[]
  onRemoveKeyframe(parentClipId: string, keyframeId: string): void
  onModifyKeyframe(parentClipId: string, paramName: string, frameOnClip: number, patch: KeyframePatch): void
}

interface State {
  keyframeDragOffsetX: number
}

// typeof

export const KeyframeMediator = ({
  activeClip,
  entity,
  paramName,
  descriptor,
  keyframeViewViewBox,
  graphWidth,
  graphHeight,
  scrollLeft,
  pxPerSec,
  scale,
  keyframes,
  onRemoveKeyframe,
  onModifyKeyframe,
}: OwnProps) => {
  const { activeComp } = useStore(getStore => ({
    activeComp: getActiveComp(getStore),
  }))

  return (
    <KeyframeGraph
      composition={activeComp!}
      parentClip={activeClip}
      entity={entity}
      paramName={paramName}
      descriptor={descriptor}
      width={graphWidth}
      height={graphHeight}
      viewBox={`0 0 ${keyframeViewViewBox!.width} ${keyframeViewViewBox!.height}`!}
      scrollLeft={scrollLeft}
      pxPerSec={pxPerSec}
      zoomScale={scale}
      keyframes={keyframes}
      onKeyframeRemove={onRemoveKeyframe}
      onModified={onModifyKeyframe}
    />
  )
}
