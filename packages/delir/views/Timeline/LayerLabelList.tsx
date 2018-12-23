import * as Delir from '@ragg/delir-core'
import * as React from 'react'
import { SortableContainer } from 'react-sortable-hoc'

import LaneLabel from './LaneLabel'

interface Props {
    layers: Delir.Entity.Layer[]
    onLayerSelect: (layerId: string) => void
    onLayerRemove: (layerId: string) => void
}

export default SortableContainer((props: Props) => (
    <ul>
        {props.layers.map((layer, idx) => (
            <LaneLabel
                index={idx}
                key={layer.id}
                layer={layer}
                onSelect={props.onLayerSelect}
                onRemove={props.onLayerRemove}
            />
        ))}
    </ul>
))
