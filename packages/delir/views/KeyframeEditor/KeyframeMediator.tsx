import * as Delir from '@delirvfx/core'
import { connectToStores, useStore, withFleurContext } from '@fleur/fleur-react'
import * as Selection from '@simonwep/selection-js'
import * as React from 'react'
import { decorate } from '../../utils/decorate'

import { getActiveComp } from '../../domain/Editor/selectors'

import EditorStore from '../../domain/Editor/EditorStore'
import { SpreadType } from '../../utils/Spread'
import KeyframeGraph from './KeyframeGraph'

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
}: OwnProps) => {
    const [keyframeDragOffsetX, setState] = React.useState(0)

    const { activeComp } = useStore([EditorStore], getStore => ({
        activeComp: getActiveComp()(getStore),
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
            onKeyframeRemove={this.keyframeRemoved}
            onModified={this.keyframeModified}
        />
    )
}
