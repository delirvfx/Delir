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
    paramName: string
    descriptor: Delir.AnyParameterTypeDescriptor
    entity: SpreadType<Delir.Entity.Clip> | SpreadType<Delir.Entity.Effect> | null
}

interface State {
    keyframeDragOffsetX: number
}

// typeof

export const KeyframeMediator = ({ activeClip }: OwnProps) => {
    const [keyframeDragOffsetX, setState] = React.useState(0)
    const { activeComp } = useStore([EditorStore], getStore => ({
        activeComp: getActiveComp()(getStore),
    }))

    return (
        <KeyframeGraph
            composition={activeComp!}
            parentClip={activeClip}
            entity={activeEntityObject}
            paramName={activeParam.paramName!}
            descriptor={activeParamDescriptor}
            width={graphWidth}
            height={graphHeight}
            viewBox={keyframeViewViewBox!}
            scrollLeft={scrollLeft}
            pxPerSec={this.props.pxPerSec}
            zoomScale={this.props.scale}
            keyframes={keyframes}
            onKeyframeRemove={this.keyframeRemoved}
            onModified={this.keyframeModified}
        />
    )
}
