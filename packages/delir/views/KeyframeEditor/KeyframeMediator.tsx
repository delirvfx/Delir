import * as Delir from '@delirvfx/core'
import { connectToStores, useStore, withFleurContext } from '@fleur/fleur-react'
import * as Selection from '@simonwep/selection-js'
import * as React from 'react'
import { decorate } from '../../utils/decorate'

import { getActiveComp, getActiveParam } from '../../domain/Editor/selectors'

import EditorStore from '../../domain/Editor/EditorStore'
import { SpreadType } from '../../utils/Spread'
import KeyframeGraph, { KeyframePatch } from './KeyframeGraph'
import * as s from './KeyframeMediator.styl'

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

export const KeyframeDragContext = React.createContext<any>(null)

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
    const { activeComp } = useStore([EditorStore], getStore => ({
        activeComp: getActiveComp()(getStore),
    }))

    const rootRef = React.useRef<HTMLDivElement>(null)
    const selection = React.useRef<Selection | null>(null)

    const handleSelectionStop = React.useCallback(({ selectedElements }: Selection.SelectionEvent) => {
        // console.log(selectedElements)
    }, [])

    const handleValidateSelectionStart = React.useCallback((e: MouseEvent) => {
        return !(e.target as HTMLElement).closest('[data-keyframe-id]')
    }, [])

    React.useEffect(() => {
        selection.current = Selection.create({
            class: s.selectionArea,
            selectionAreaContainer: rootRef.current!,
            startareas: [`.${s.root}`],
            boundaries: [`.${s.root}`],
            selectables: ['[data-keyframe-id]'],
            validateStart: handleValidateSelectionStart,
            onStop: handleSelectionStop,
        })
    }, [])

    return (
        <div ref={rootRef} className={s.root}>
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
        </div>
    )
}
