import * as Delir from '@delirvfx/core'
import * as React from 'react'
import { SortableContainer } from 'react-sortable-hoc'

import LayerLabel from './LayerLabel'

interface Props {
    layers: Delir.Entity.Layer[]
    onLayerSelect: (layerId: string) => void
    onLayerRemove: (layerId: string) => void
}

export default SortableContainer((props: Props) => (
    <ul>
        {props.layers.map((layer, idx) => (
            <LayerLabel
                key={layer.id}
                index={idx}
                layer={layer}
                layerIndex={idx}
                onSelect={props.onLayerSelect}
                onRemove={props.onLayerRemove}
            />
        ))}
    </ul>
))
